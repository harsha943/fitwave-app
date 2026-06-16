package com.example.fitwave.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fitwave.data.AuthState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonalDetailsScreen(navController: NavController) {
    var isEditing by remember { mutableStateOf(false) }
    
    var name by remember { mutableStateOf(AuthState.registeredName.ifEmpty { "John Doe" }) }
    var email by remember { mutableStateOf(AuthState.registeredEmail.ifEmpty { "john.doe@example.com" }) }
    var phone by remember { mutableStateOf(AuthState.registeredPhone) }
    var location by remember { mutableStateOf(AuthState.registeredLocation) }
    var age by remember { mutableStateOf(AuthState.age.toString()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Personal Information") },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                if (isEditing) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = location,
                        onValueChange = { location = it },
                        label = { Text("Location") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = age,
                        onValueChange = { age = it },
                        label = { Text("Age") },
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    DetailItem("Full Name", AuthState.registeredName.ifEmpty { "John Doe" })
                    DetailItem("Email", AuthState.registeredEmail.ifEmpty { "john.doe@example.com" })
                    DetailItem("Phone", AuthState.registeredPhone)
                    DetailItem("Location", AuthState.registeredLocation)
                    DetailItem("Age", AuthState.age.toString())
                }
            }
            
            item {
                Button(
                    onClick = { 
                        if (isEditing) {
                            AuthState.age = age.toIntOrNull() ?: AuthState.age
                            AuthState.updateProfile(name, email, phone, location)
                            isEditing = false
                        } else {
                            isEditing = true
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(if (isEditing) "Save Profile" else "Edit Profile", fontWeight = FontWeight.Bold)
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

@Composable
fun DetailItem(label: String, value: String) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text(text = label, fontSize = 14.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
        Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Medium)
        HorizontalDivider(modifier = Modifier.padding(top = 8.dp), color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.1f))
    }
}
