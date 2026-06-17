package com.example.fitwave.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fitwave.navigation.Screen
import com.example.fitwave.ui.components.BottomBar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkoutSelectionScreen(navController: NavController) {
    var selectedGoal by remember { mutableStateOf("Weight Loss") }
    var selectedLevel by remember { mutableStateOf("Beginner") }

    Scaffold(
        bottomBar = { BottomBar(navController) },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Personalize Your Plan",
                color = MaterialTheme.colorScheme.primary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Goal Selection
            Text(
                text = "Select Your Goal",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(12.dp))
            GoalOption("Weight Loss", selectedGoal == "Weight Loss") { selectedGoal = "Weight Loss" }
            Spacer(modifier = Modifier.height(8.dp))
            GoalOption("Muscle Gain", selectedGoal == "Muscle Gain") { selectedGoal = "Muscle Gain" }
            Spacer(modifier = Modifier.height(8.dp))
            GoalOption("Yoga", selectedGoal == "Yoga") { selectedGoal = "Yoga" }
            Spacer(modifier = Modifier.height(8.dp))
            GoalOption("HIIT", selectedGoal == "HIIT") { selectedGoal = "HIIT" }

            Spacer(modifier = Modifier.height(32.dp))

            // Level Selection
            Text(
                text = "Select Your Level",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(12.dp))
            LevelOption("Beginner", selectedLevel == "Beginner") { selectedLevel = "Beginner" }
            Spacer(modifier = Modifier.height(8.dp))
            LevelOption("Intermediate", selectedLevel == "Intermediate") { selectedLevel = "Intermediate" }
            Spacer(modifier = Modifier.height(8.dp))
            LevelOption("Advanced", selectedLevel == "Advanced") { selectedLevel = "Advanced" }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = {
                    navController.navigate(Screen.GeneratedWorkoutPlan.createRoute(selectedGoal, selectedLevel))
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Generate My Plan", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun GoalOption(goal: String, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
    ) {
        Text(
            text = goal,
            modifier = Modifier.padding(16.dp),
            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun LevelOption(level: String, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.surface,
        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
    ) {
        Text(
            text = level,
            modifier = Modifier.padding(16.dp),
            color = if (isSelected) MaterialTheme.colorScheme.onSecondary else MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Medium
        )
    }
}
