package com.example.fitwave.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fitwave.data.HealthState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatusDetailScreen(navController: NavController, statType: String) {
    val config = getStatConfig(statType)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(config.title) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            item {
                StatOverviewCard(config)
                Spacer(modifier = Modifier.height(24.dp))
            }

            if (statType == "Steps") {
                item {
                    Button(
                        onClick = { HealthState.resetSteps() },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error.copy(alpha = 0.1f))
                    ) {
                        Text("Reset Step Counter", color = MaterialTheme.colorScheme.error)
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }

            item {
                Text("Insights", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(config.insight, fontSize = 16.sp, lineHeight = 24.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun StatOverviewCard(config: StatConfig) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = config.color.copy(alpha = 0.1f))
    ) {
        Row(
            modifier = Modifier.padding(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(config.color.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(config.icon, contentDescription = null, tint = config.color, modifier = Modifier.size(32.dp))
            }
            Spacer(modifier = Modifier.width(20.dp))
            Column {
                Text(text = "Current Value", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                Text(text = config.value, fontSize = 32.sp, fontWeight = FontWeight.Bold, color = config.color)
            }
        }
    }
}

data class StatConfig(
    val title: String,
    val value: String,
    val icon: ImageVector,
    val color: Color,
    val insight: String
)

@Composable
fun getStatConfig(type: String): StatConfig {
    return when (type) {
        "Water" -> StatConfig(
            "Hydration", "1.5 L", Icons.Default.WaterDrop, Color(0xFF2196F3),
            "You have completed 75% of your daily water goal. Keep drinking to stay focused!"
        )
        "Sleep" -> StatConfig(
            "Sleep Analysis", "7h 20m", Icons.Default.Bedtime, Color(0xFF9C27B0),
            "Your deep sleep was excellent last night. You are well-rested for today's workout."
        )
        "BMI" -> StatConfig(
            "Body Mass Index", "22.4", Icons.Default.Accessibility, Color(0xFF4CAF50),
            "Your BMI is within the healthy range. Maintaining a balanced diet and regular exercise is key."
        )
        "Steps" -> StatConfig(
            "Step Tracker", "${HealthState.steps}", Icons.Default.DirectionsWalk, Color(0xFFFFC107),
            if (HealthState.steps >= 10000) "Goal reached! Amazing job!" else "Almost there! Only ${10000 - HealthState.steps} more steps to reach your 10,000 steps daily goal."
        )
        "Blood Oxygen" -> StatConfig(
            "Blood Oxygen", "${HealthState.bloodOxygen}%", Icons.Default.Air, Color(0xFF00BCD4),
            "Your blood oxygen levels are optimal. This indicates healthy respiratory and circulatory function."
        )
        "Stress Level" -> StatConfig(
            "Stress Level", HealthState.stressLevel, Icons.Default.SentimentSatisfied, Color(0xFFFF9800),
            "Your stress levels are low. Keep maintaining a healthy work-life balance and practicing mindfulness."
        )
        "Body Temp" -> StatConfig(
            "Body Temp", "%.1f°C".format(HealthState.bodyTemp), Icons.Default.Thermostat, Color(0xFFFF5252),
            "Your body temperature is normal. Stay hydrated and monitor if you feel any discomfort."
        )
        "Blood Pressure" -> StatConfig(
            "Blood Pressure", HealthState.bloodPressure, Icons.Default.Bloodtype, Color(0xFFE91E63),
            "Your blood pressure is in the ideal range (Normotensive). A low-sodium diet helps maintain this."
        )
        else -> StatConfig(
            "Health Stat", "-", Icons.Default.Info, Color.Gray,
            "Detailed data for this metric will be available soon."
        )
    }
}
