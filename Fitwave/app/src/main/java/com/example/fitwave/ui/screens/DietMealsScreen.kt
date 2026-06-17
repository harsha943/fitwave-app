package com.example.fitwave.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fitwave.data.HealthState
import com.example.fitwave.navigation.Screen
import com.example.fitwave.ui.components.BottomBar
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DietMealsScreen(navController: NavController) {
    var selectedDay by remember { mutableStateOf(getCurrentDayForMeals()) }
    val days = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

    Scaffold(
        bottomBar = { BottomBar(navController) },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            Text(
                text = "Diet & Meals",
                color = MaterialTheme.colorScheme.primary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Day Selector
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(days) { day ->
                    MealDayItem(
                        day = day,
                        isSelected = selectedDay == day,
                        onClick = { selectedDay = day }
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Meal Plan - $selectedDay",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            val meals = weeklyMealData[selectedDay] ?: emptyList()
            LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                items(meals) { meal ->
                    MealItem(navController, meal)
                }
            }
        }
    }
}

@Composable
fun MealDayItem(day: String, isSelected: Boolean, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(55.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface)
            .clickable { onClick() }
            .padding(vertical = 12.dp)
    ) {
        Text(
            text = day,
            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            fontSize = 14.sp
        )
    }
}

data class Meal(val type: String, val name: String, val calories: String, val protein: String)

val weeklyMealData = mapOf(
    "Mon" to listOf(
        Meal("Breakfast", "Oatmeal with Berries", "350 kcal", "12g"),
        Meal("Lunch", "Grilled Chicken Salad", "450 kcal", "35g"),
        Meal("Dinner", "Baked Salmon & Asparagus", "500 kcal", "40g")
    ),
    "Tue" to listOf(
        Meal("Breakfast", "Greek Yogurt Parfait", "300 kcal", "20g"),
        Meal("Lunch", "Quinoa & Black Bean Bowl", "400 kcal", "15g"),
        Meal("Dinner", "Lean Turkey Meatballs", "550 kcal", "38g")
    ),
    "Wed" to listOf(
        Meal("Breakfast", "Egg White Omelet", "250 kcal", "25g"),
        Meal("Lunch", "Tuna Salad Wrap", "420 kcal", "30g"),
        Meal("Dinner", "Stir-fry Tofu & Broccoli", "380 kcal", "20g")
    ),
    "Thu" to listOf(
        Meal("Breakfast", "Smoothie Bowl", "320 kcal", "10g"),
        Meal("Lunch", "Beef & Barley Soup", "480 kcal", "28g"),
        Meal("Dinner", "Grilled Shrimp Tacos", "450 kcal", "32g")
    ),
    "Fri" to listOf(
        Meal("Breakfast", "Avocado Toast with Egg", "400 kcal", "15g"),
        Meal("Lunch", "Lentil Soup", "350 kcal", "18g"),
        Meal("Dinner", "Roast Chicken Breast", "500 kcal", "45g")
    ),
    "Sat" to listOf(
        Meal("Breakfast", "Whole Grain Pancakes", "450 kcal", "15g"),
        Meal("Lunch", "Cobb Salad", "520 kcal", "35g"),
        Meal("Dinner", "Steak & Sweet Potato", "650 kcal", "50g")
    ),
    "Sun" to listOf(
        Meal("Breakfast", "Chia Seed Pudding", "280 kcal", "10g"),
        Meal("Lunch", "Vegetable Lasagna", "450 kcal", "18g"),
        Meal("Dinner", "Chicken & Brown Rice", "480 kcal", "35g")
    )
)

fun getCurrentDayForMeals(): String {
    val calendar = Calendar.getInstance()
    return when (calendar.get(Calendar.DAY_OF_WEEK)) {
        Calendar.MONDAY -> "Mon"
        Calendar.TUESDAY -> "Tue"
        Calendar.WEDNESDAY -> "Wed"
        Calendar.THURSDAY -> "Thu"
        Calendar.FRIDAY -> "Fri"
        Calendar.SATURDAY -> "Sat"
        Calendar.SUNDAY -> "Sun"
        else -> "Mon"
    }
}

@Composable
fun MealItem(navController: NavController, meal: Meal) {
    val mealId = "${meal.type}-${meal.name}"
    val isTaken = HealthState.takenMeals.contains(mealId)
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                navController.navigate(Screen.MealDetails.createRoute(meal.name))
            },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isTaken) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) 
                             else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(50.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        if (isTaken) MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                        else MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)
                    )
                    .clickable {
                        val cals = meal.calories.replace(" kcal", "").toIntOrNull() ?: 0
                        val protein = meal.protein.replace("g", "").toIntOrNull() ?: 0
                        HealthState.toggleMeal(mealId, cals, protein)
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isTaken) Icons.Default.Check else Icons.Default.Fastfood,
                    contentDescription = null, 
                    tint = if (isTaken) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = meal.type, 
                    color = if (isTaken) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.primary, 
                    fontSize = 12.sp, 
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = meal.name, 
                    fontWeight = FontWeight.Bold, 
                    fontSize = 16.sp,
                    color = if (isTaken) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocalFireDepartment, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.Red)
                    Text(
                        text = "${meal.calories} | Protein: ${meal.protein}",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
            if (isTaken) {
                Text(
                    text = "TAKEN",
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
    }
}
