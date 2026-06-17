package com.example.fitwave

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.navigation.compose.rememberNavController
import com.example.fitwave.data.AuthState
import com.example.fitwave.data.HealthState
import com.example.fitwave.navigation.SetupNavGraph
import com.example.fitwave.ui.theme.FitwaveTheme
import kotlinx.coroutines.delay
import kotlin.math.sqrt

class MainActivity : ComponentActivity(), SensorEventListener {
    private var sensorManager: SensorManager? = null
    private var stepSensor: Sensor? = null
    private var accelSensor: Sensor? = null

    // Pedometer Fallback variables
    private var magnitudePrevious = 0f
    private var stepCountThreshold = 10.5f // Lowered threshold for better detection

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            registerSensors()
        } else {
            Log.e("Fitwave", "Permission denied for Activity Recognition")
            // Still try to register accelerometer as it doesn't need activity permission
            registerAccelerometer()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AuthState.init(this)
        HealthState.init(this)
        enableEdgeToEdge()

        checkPermissionsAndRegister()

        setContent {
            LaunchedEffect(Unit) {
                while (true) {
                    delay(2000)
                    HealthState.simulateMetrics()
                }
            }

            FitwaveTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    SetupNavGraph(navController = navController)
                }
            }
        }
    }

    private fun checkPermissionsAndRegister() {
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.ACTIVITY_RECOGNITION)
            } else {
                registerSensors()
            }
        } else {
            registerSensors()
        }
    }

    private fun registerSensors() {
        // Try hardware step counter
        stepSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR)
        
        if (stepSensor != null) {
            Log.d("Fitwave", "Using Hardware Step Detector")
            sensorManager?.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_UI)
        } else {
            // Fallback to Accelerometer
            registerAccelerometer()
        }
    }

    private fun registerAccelerometer() {
        Log.d("Fitwave", "Hardware Step sensor missing, using Accelerometer fallback")
        accelSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        accelSensor?.let {
            sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        if (event.sensor.type == Sensor.TYPE_STEP_DETECTOR) {
            if (event.values[0] == 1.0f) {
                HealthState.saveSteps(HealthState.steps + 1)
            }
        } else if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val x = event.values[0]
            val y = event.values[1]
            val z = event.values[2]
            
            val magnitude = sqrt((x * x + y * y + z * z).toDouble()).toFloat()
            val magnitudeDelta = magnitude - magnitudePrevious
            magnitudePrevious = magnitude

            if (magnitudeDelta > stepCountThreshold) {
                HealthState.saveSteps(HealthState.steps + 1)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onResume() {
        super.onResume()
        stepSensor?.let { sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
        accelSensor?.let { sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
    }
}
