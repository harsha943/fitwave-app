package com.example.fitwave.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fitwave.data.HealthState
import com.example.fitwave.navigation.Screen
import com.example.fitwave.ui.components.BottomBar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(navController: NavController) {
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
                    text = "Hello, GymRat!",
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Let's smash your goals today.",
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                MainScoreCard()
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Text(
                    text = "Daily Stats",
                    color = MaterialTheme.colorScheme.onBackground,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                StatsGrid(navController)
            }
        }
    }
}

@Composable
fun MainScoreCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Daily Fitness Score",
                color = MaterialTheme.colorScheme.onPrimary,
                fontSize = 18.sp
            )
            Text(
                text = "85",
                color = MaterialTheme.colorScheme.onPrimary,
                fontSize = 64.sp,
                fontWeight = FontWeight.Black
            )
            LinearProgressIndicator(
                progress = 0.85f,
                modifier = Modifier.fillMaxWidth().height(8.dp).padding(vertical = 8.dp),
                color = MaterialTheme.colorScheme.onPrimary,
                trackColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.3f)
            )
            Text(
                text = "Great job! You're ahead of 70% of users.",
                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f),
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun StatsGrid(navController: NavController) {
    val stats = listOf(
        StatData("Calories", "${HealthState.consumedCalories} kcal", Icons.Default.LocalFireDepartment, Color(0xFFFF5722), Screen.DietMeals.route),
        StatData("Heart Rate", "${HealthState.heartRate} bpm", Icons.Default.Favorite, Color(0xFFE91E63), Screen.HealthAnalysis.route),
        StatData("Water", "1.5 L", Icons.Default.WaterDrop, Color(0xFF2196F3), Screen.StatusDetail.createRoute("Water")),
        StatData("Sleep", "7h 20m", Icons.Default.Bedtime, Color(0xFF9C27B0), Screen.StatusDetail.createRoute("Sleep")),
        StatData("BMI", "22.4", Icons.Default.Accessibility, Color(0xFF4CAF50), Screen.StatusDetail.createRoute("BMI")),
        StatData("Steps", "${HealthState.steps}", Icons.Default.DirectionsWalk, Color(0xFFFFC107), Screen.StatusDetail.createRoute("Steps"))
    )

    Column {
        for (i in stats.indices step 2) {
            Row(modifier = Modifier.fillMaxWidth()) {
                StatCard(stats[i], modifier = Modifier.weight(1f)) {
                    stats[i].route?.let { navController.navigate(it) }
                }
                Spacer(modifier = Modifier.width(16.dp))
                if (i + 1 < stats.size) {
                    StatCard(stats[i + 1], modifier = Modifier.weight(1f)) {
                        stats[i + 1].route?.let { navController.navigate(it) }
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

data class StatData(val title: String, val value: String, val icon: ImageVector, val color: Color, val route: String? = null)

@Composable
fun StatCard(stat: StatData, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Icon(stat.icon, contentDescription = null, tint = stat.color, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = stat.title, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            Text(text = stat.value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}
