package com.example.fitwave.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MealDetailsScreen(navController: NavController, mealName: String) {
    // In a real app, you'd fetch this data from a repository using the mealName
    val mealInfo = getMealInfo(mealName)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Meal Details") },
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
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Restaurant,
                        contentDescription = null,
                        modifier = Modifier.size(80.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
                
                Text(
                    text = mealName,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.LocalFireDepartment,
                        contentDescription = null,
                        tint = Color.Red,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = "${mealInfo.calories} kcal",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Text("Nutrition Facts", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                NutritionCard(mealInfo)
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Text("Key Ingredients", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = mealInfo.ingredients,
                    fontSize = 16.sp,
                    lineHeight = 24.sp,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f)
                )
            }
        }
    }
}

@Composable
fun NutritionCard(info: MealDetailedInfo) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            NutritionRow("Protein", info.protein)
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
            NutritionRow("Carbs", info.carbs)
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
            NutritionRow("Fats", info.fats)
        }
    }
}

@Composable
fun NutritionRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
        Text(value, fontWeight = FontWeight.Bold)
    }
}

data class MealDetailedInfo(
    val calories: String,
    val protein: String,
    val carbs: String,
    val fats: String,
    val ingredients: String
)

fun getMealInfo(name: String): MealDetailedInfo {
    return when {
        name.contains("Oatmeal") -> MealDetailedInfo("350", "12g", "60g", "5g", "• Rolled Oats\n• Fresh Blueberries\n• Almond Milk\n• Chia Seeds\n• Honey")
        name.contains("Chicken Salad") -> MealDetailedInfo("450", "35g", "15g", "12g", "• Grilled Chicken Breast\n• Mixed Greens\n• Cherry Tomatoes\n• Avocado\n• Olive Oil Dressing")
        name.contains("Salmon") -> MealDetailedInfo("500", "40g", "10g", "22g", "• Atlantic Salmon\n• Asparagus Spears\n• Lemon Juice\n• Garlic Butter\n• Quinoa")
        else -> MealDetailedInfo("400", "25g", "30g", "15g", "• Whole Grains\n• Lean Protein Source\n• Fresh Seasonal Vegetables\n• Healthy Fats (Nuts/Seeds)")
    }
}
