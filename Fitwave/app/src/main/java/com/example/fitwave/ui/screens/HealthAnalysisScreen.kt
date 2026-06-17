package com.example.fitwave.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fitwave.data.HealthState
import com.example.fitwave.navigation.Screen
import com.example.fitwave.ui.components.BottomBar
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HealthAnalysisScreen(navController: NavController) {
    Scaffold(
        bottomBar = { BottomBar(navController) },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            item {
                Text(
                    text = "Health Analysis",
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                LiveHeartRateCard()
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                HealthMetricsGrid(navController)
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                AIHealthInsights()
            }
        }
    }
}

@Composable
fun LiveHeartRateCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Real-time Heart Rate", fontWeight = FontWeight.Medium)
                Icon(Icons.Default.Favorite, contentDescription = null, tint = Color.Red)
            }
            Spacer(modifier = Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                Text(text = HealthState.heartRate.toString(), fontSize = 48.sp, fontWeight = FontWeight.Bold)
                Text(text = " bpm", fontSize = 18.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), modifier = Modifier.padding(bottom = 8.dp))
            }
            
            Box(modifier = Modifier.fillMaxWidth().height(80.dp).padding(vertical = 8.dp)) {
                HeartRateWave()
            }
        }
    }
}

@Composable
fun HeartRateWave() {
    val primaryColor = MaterialTheme.colorScheme.primary
    Canvas(modifier = Modifier.fillMaxSize()) {
        val path = Path()
        val width = size.width
        val height = size.height
        path.moveTo(0f, height / 2)
        for (i in 0..10) {
            val x = (i * width / 10)
            val y = if (i % 2 == 0) height / 4 else 3 * height / 4
            path.lineTo(x, y)
        }
        drawPath(path, color = primaryColor, style = Stroke(width = 3.dp.toPx()))
    }
}

@Composable
fun HealthMetricsGrid(navController: NavController) {
    Column {
        HealthMetricRow(
            label1 = "Blood Oxygen", value1 = "${HealthState.bloodOxygen}%", icon1 = Icons.Default.Air, color1 = Color(0xFF00BCD4),
            onClick1 = { navController.navigate(Screen.StatusDetail.createRoute("Blood Oxygen")) },
            label2 = "Stress Level", value2 = HealthState.stressLevel, icon2 = Icons.Default.SentimentSatisfied, color2 = Color(0xFFFF9800),
            onClick2 = { navController.navigate(Screen.StatusDetail.createRoute("Stress Level")) }
        )
        Spacer(modifier = Modifier.height(16.dp))
        HealthMetricRow(
            label1 = "Body Temp", value1 = "%.1f°C".format(HealthState.bodyTemp), icon1 = Icons.Default.Thermostat, color1 = Color(0xFFFF5252),
            onClick1 = { navController.navigate(Screen.StatusDetail.createRoute("Body Temp")) },
            label2 = "Blood Pressure", value2 = HealthState.bloodPressure, icon2 = Icons.Default.Bloodtype, color2 = Color(0xFFE91E63),
            onClick2 = { navController.navigate(Screen.StatusDetail.createRoute("Blood Pressure")) }
        )
    }
}

@Composable
fun HealthMetricRow(
    label1: String, value1: String, icon1: ImageVector, color1: Color, onClick1: () -> Unit,
    label2: String, value2: String, icon2: ImageVector, color2: Color, onClick2: () -> Unit
) {
    Row(modifier = Modifier.fillMaxWidth()) {
        MetricCard(label1, value1, icon1, color1, modifier = Modifier.weight(1f), onClick = onClick1)
        Spacer(modifier = Modifier.width(16.dp))
        MetricCard(label2, value2, icon2, color2, modifier = Modifier.weight(1f), onClick = onClick2)
    }
}

@Composable
fun MetricCard(label: String, value: String, icon: ImageVector, color: Color, modifier: Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Icon(icon, contentDescription = null, tint = color)
            Spacer(modifier = Modifier.height(8.dp))
            Text(label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun AIHealthInsights() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(8.dp))
                Text("AI Health Insights", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                "Your heart rate variability is optimal today. It's a great time for a high-intensity interval training (HIIT) session.",
                fontSize = 14.sp
            )
        }
    }
}
