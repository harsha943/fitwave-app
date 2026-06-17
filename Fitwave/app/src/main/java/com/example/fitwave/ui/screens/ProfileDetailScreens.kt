package com.example.fitwave.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fitwave.data.AuthState
import com.example.fitwave.data.getCurrentDayName
import com.example.fitwave.data.weeklyWorkoutData

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            var pushEnabled by remember { mutableStateOf(true) }
            var emailEnabled by remember { mutableStateOf(false) }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Push Notifications", modifier = Modifier.weight(1f))
                Switch(checked = pushEnabled, onCheckedChange = { pushEnabled = it })
            }
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Email Notifications", modifier = Modifier.weight(1f))
                Switch(checked = emailEnabled, onCheckedChange = { emailEnabled = it })
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrivacySettingsScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Privacy Settings") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Privacy controls and account security options go here.")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhysicalMetricsScreen(navController: NavController) {
    var isEditing by remember { mutableStateOf(false) }
    
    var height by remember { mutableStateOf(AuthState.height) }
    var weight by remember { mutableStateOf(AuthState.weight) }
    var bodyFat by remember { mutableStateOf(AuthState.bodyFat) }
    var muscleMass by remember { mutableStateOf(AuthState.muscleMass) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Physical Metrics") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                if (isEditing) {
                    OutlinedTextField(
                        value = height,
                        onValueChange = { height = it },
                        label = { Text("Height") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = weight,
                        onValueChange = { weight = it },
                        label = { Text("Weight") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = bodyFat,
                        onValueChange = { bodyFat = it },
                        label = { Text("Body Fat %") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = muscleMass,
                        onValueChange = { muscleMass = it },
                        label = { Text("Muscle Mass") },
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    DetailItem("Height", AuthState.height)
                    DetailItem("Weight", AuthState.weight)
                    DetailItem("Body Fat", AuthState.bodyFat)
                    DetailItem("Muscle Mass", AuthState.muscleMass)
                }
            }

            item {
                Button(
                    onClick = { 
                        if (isEditing) {
                            AuthState.updateMetrics(height, weight, bodyFat, muscleMass)
                            isEditing = false
                        } else {
                            isEditing = true
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(if (isEditing) "Save Metrics" else "Edit Metrics", fontWeight = FontWeight.Bold)
                }
                
                if (isEditing) {
                    TextButton(
                        onClick = { isEditing = false },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Cancel", color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActivityHistoryScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Today's Schedule") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        val today = getCurrentDayName()
        val activities = weeklyWorkoutData[today] ?: emptyList()
        
        LazyColumn(modifier = Modifier.padding(padding).padding(16.dp)) {
            if (activities.isEmpty()) {
                item {
                    Text("No activities scheduled for today (Rest Day).", modifier = Modifier.padding(vertical = 8.dp), fontSize = 16.sp)
                }
            } else {
                items(activities) { workout ->
                    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                        Text(text = workout.name, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Text(
                            text = "${workout.sets} | ${workout.reps} (${workout.duration})",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                    HorizontalDivider()
                }
            }
        }
    }
}
