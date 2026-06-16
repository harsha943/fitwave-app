package com.example.fitwave.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
import com.example.fitwave.data.AuthState
import com.example.fitwave.navigation.Screen
import com.example.fitwave.ui.components.BottomBar
import com.google.firebase.auth.FirebaseAuth

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(navController: NavController) {
    Scaffold(
        bottomBar = { BottomBar(navController) },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Text(
                    text = "Profile",
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(32.dp))
            }

            item {
                ProfileHeader()
                Spacer(modifier = Modifier.height(32.dp))
            }

            item {
                ProfileSection("Account") {
                    ProfileMenuItem("Personal Information", Icons.Default.Person) {
                        navController.navigate(Screen.PersonalDetails.route)
                    }
                    ProfileMenuItem("Notifications", Icons.Default.Notifications) {
                        navController.navigate(Screen.Notifications.route)
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                ProfileSection("Health Data") {
                    ProfileMenuItem("Physical Metrics", Icons.Default.Straighten) {
                        navController.navigate(Screen.PhysicalMetrics.route)
                    }
                    ProfileMenuItem("Activity History", Icons.Default.History) {
                        navController.navigate(Screen.ActivityHistory.route)
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Button(
                    onClick = { 
                        // Logout from Firebase and local state
                        FirebaseAuth.getInstance().signOut()
                        AuthState.logout()
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0)
                        } 
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.1f)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Logout", color = Color.Red, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun ProfileHeader() {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(100.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(60.dp), tint = MaterialTheme.colorScheme.primary)
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = AuthState.registeredName.ifEmpty { "John Doe" }, 
            fontSize = 22.sp, 
            fontWeight = FontWeight.Bold
        )
        Text("Pro Member", fontSize = 14.sp, color = MaterialTheme.colorScheme.primary)
    }
}

@Composable
fun ProfileSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
        Spacer(modifier = Modifier.height(8.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column {
                content()
            }
        }
    }
}

@Composable
fun ProfileMenuItem(label: String, icon: ImageVector, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        color = Color.Transparent,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(24.dp), tint = MaterialTheme.colorScheme.onSurface)
            Spacer(modifier = Modifier.width(16.dp))
            Text(label, modifier = Modifier.weight(1f))
            Icon(Icons.Default.ChevronRight, contentDescription = null, modifier = Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f))
        }
    }
}
