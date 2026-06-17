package com.example.fitwave.data

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

/**
 * A simple global state to track health metrics across screens.
 */
object HealthState {
    private lateinit var preferences: SharedPreferences

    var consumedCalories by mutableStateOf(1450)
    var consumedProtein by mutableStateOf(85)
    
    // Live Metrics
    var heartRate by mutableStateOf(72)
    var bloodOxygen by mutableStateOf(98)
    var stressLevel by mutableStateOf("Low")
    var bodyTemp by mutableStateOf(36.6f)
    var bloodPressure by mutableStateOf("120/80")
    var steps by mutableStateOf(0)

    var takenMeals by mutableStateOf(setOf<String>())

    fun init(context: Context) {
        preferences = context.getSharedPreferences("health_prefs", Context.MODE_PRIVATE)
        // Check if we need to force reset for the user
        val version = preferences.getInt("version", 0)
        if (version < 1) {
            preferences.edit().putInt("steps", 0).putInt("version", 1).apply()
        }
        steps = preferences.getInt("steps", 0)
        consumedCalories = preferences.getInt("calories", 1450)
    }

    fun resetSteps() {
        saveSteps(0)
    }

    fun saveSteps(newSteps: Int) {
        steps = newSteps
        preferences.edit().putInt("steps", steps).apply()
    }

    fun toggleMeal(mealId: String, calories: Int, protein: Int) {
        val currentMeals = takenMeals.toMutableSet()
        if (currentMeals.contains(mealId)) {
            currentMeals.remove(mealId)
            consumedCalories -= calories
            consumedProtein -= protein
        } else {
            currentMeals.add(mealId)
            consumedCalories += calories
            consumedProtein += protein
        }
        takenMeals = currentMeals
        preferences.edit().putInt("calories", consumedCalories).apply()
    }

    // Function to simulate real-time updates for other metrics
    fun simulateMetrics() {
        heartRate = (68..80).random()
        bloodOxygen = (97..99).random()
        stressLevel = listOf("Low", "Normal", "Calm").random()
        bodyTemp = 36.4f + (0..5).random() * 0.1f
        val sys = (115..128).random()
        val dia = (75..85).random()
        bloodPressure = "$sys/$dia"
    }
}
