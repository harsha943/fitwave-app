package com.example.fitwave.data

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

/**
 * A persistent global state to store user data across app restarts.
 */
object AuthState {
    private lateinit var preferences: SharedPreferences

    var registeredEmail by mutableStateOf("")
    var registeredPassword by mutableStateOf("")
    var registeredName by mutableStateOf("")
    var registeredPhone by mutableStateOf("+1 234 567 890")
    var registeredLocation by mutableStateOf("New York, USA")
    var age by mutableStateOf(25)
    var isLoggedIn by mutableStateOf(false)
    var hasRegistered by mutableStateOf(false)

    // Physical Metrics
    var height by mutableStateOf("180 cm")
    var weight by mutableStateOf("75 kg")
    var bodyFat by mutableStateOf("15%")
    var muscleMass by mutableStateOf("60 kg")

    fun init(context: Context) {
        preferences = context.getSharedPreferences("fitwave_prefs", Context.MODE_PRIVATE)
        loadData()
    }

    private fun loadData() {
        registeredEmail = preferences.getString("email", "") ?: ""
        registeredPassword = preferences.getString("password", "") ?: ""
        registeredName = preferences.getString("name", "") ?: ""
        registeredPhone = preferences.getString("phone", "+1 234 567 890") ?: "+1 234 567 890"
        registeredLocation = preferences.getString("location", "New York, USA") ?: "New York, USA"
        age = preferences.getInt("age", 25)
        isLoggedIn = preferences.getBoolean("is_logged_in", false)
        hasRegistered = preferences.getBoolean("has_registered", false)
        
        height = preferences.getString("height", "180 cm") ?: "180 cm"
        weight = preferences.getString("weight", "75 kg") ?: "75 kg"
        bodyFat = preferences.getString("body_fat", "15%") ?: "15%"
        muscleMass = preferences.getString("muscle_mass", "60 kg") ?: "60 kg"
    }

    private fun saveData() {
        preferences.edit().apply {
            putString("email", registeredEmail)
            putString("password", registeredPassword)
            putString("name", registeredName)
            putString("phone", registeredPhone)
            putString("location", registeredLocation)
            putInt("age", age)
            putBoolean("is_logged_in", isLoggedIn)
            putBoolean("has_registered", hasRegistered)
            
            putString("height", height)
            putString("weight", weight)
            putString("body_fat", bodyFat)
            putString("muscle_mass", muscleMass)
            apply()
        }
    }

    fun register(name: String, email: String, pass: String) {
        registeredName = name
        registeredEmail = email
        registeredPassword = pass
        hasRegistered = true
        isLoggedIn = true
        saveData()
    }

    fun updateProfile(name: String, email: String, phone: String, location: String) {
        registeredName = name
        registeredEmail = email
        registeredPhone = phone
        registeredLocation = location
        saveData()
    }

    fun updateMetrics(newHeight: String, newWeight: String, newBodyFat: String, newMuscleMass: String) {
        height = newHeight
        weight = newWeight
        bodyFat = newBodyFat
        muscleMass = newMuscleMass
        saveData()
    }

    fun login() {
        isLoggedIn = true
        saveData()
    }

    fun logout() {
        isLoggedIn = false
        saveData()
    }

    fun isValidLogin(email: String, pass: String): Boolean {
        return email == registeredEmail && pass == registeredPassword && email.isNotEmpty()
    }

    fun isEmailRegistered(email: String): Boolean {
        return email == registeredEmail && email.isNotEmpty()
    }

    fun resetPassword(newPass: String) {
        registeredPassword = newPass
        saveData()
    }
}
