package com.example.fitwave.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.fitwave.ui.screens.*

@Composable
fun SetupNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(route = Screen.Splash.route) {
            SplashScreen(navController = navController)
        }
        composable(route = Screen.Login.route) {
            LoginScreen(navController = navController)
        }
        composable(route = Screen.Register.route) {
            RegisterScreen(navController = navController)
        }
        composable(route = Screen.Dashboard.route) {
            DashboardScreen(navController = navController)
        }
        composable(route = Screen.WorkoutPlanner.route) {
            WorkoutPlannerScreen(navController = navController)
        }
        composable(route = Screen.HealthAnalysis.route) {
            HealthAnalysisScreen(navController = navController)
        }
        composable(route = Screen.AIAssistant.route) {
            AIAssistantScreen(navController = navController)
        }
        composable(route = Screen.ProgressReports.route) {
            ProgressReportsScreen(navController = navController)
        }
        composable(route = Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }
        composable(route = Screen.DietMeals.route) {
            println("DEBUG: Rendering DietMealsScreen")
            DietMealsScreen(navController = navController)
        }
        composable(route = Screen.PersonalDetails.route) {
            PersonalDetailsScreen(navController = navController)
        }
        composable(route = Screen.ForgotPassword.route) {
            ForgotPasswordScreen(navController = navController)
        }
        composable(route = Screen.Notifications.route) {
            NotificationsScreen(navController = navController)
        }
        composable(route = Screen.PhysicalMetrics.route) {
            PhysicalMetricsScreen(navController = navController)
        }
        composable(route = Screen.ActivityHistory.route) {
            ActivityHistoryScreen(navController = navController)
        }
        composable(route = Screen.WorkoutLevel.route) {
            WorkoutSelectionScreen(navController = navController)
        }
        composable(
            route = Screen.GeneratedWorkoutPlan.route,
            arguments = listOf(
                navArgument("goal") { type = NavType.StringType },
                navArgument("level") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val goal = backStackEntry.arguments?.getString("goal") ?: "Weight Loss"
            val level = backStackEntry.arguments?.getString("level") ?: "Beginner"
            WorkoutPlanScreen(navController = navController, goal = goal, level = level)
        }
        composable(
            route = Screen.StatusDetail.route,
            arguments = listOf(navArgument("statType") { type = NavType.StringType })
        ) { backStackEntry ->
            val statType = backStackEntry.arguments?.getString("statType") ?: ""
            StatusDetailScreen(navController = navController, statType = statType)
        }
        composable(
            route = Screen.MealDetails.route,
            arguments = listOf(navArgument("mealName") { type = NavType.StringType })
        ) { backStackEntry ->
            val mealName = backStackEntry.arguments?.getString("mealName") ?: ""
            MealDetailsScreen(navController = navController, mealName = mealName)
        }
    }
}