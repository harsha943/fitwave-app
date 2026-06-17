package com.example.fitwave.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object Dashboard : Screen("dashboard")
    object WorkoutPlanner : Screen("workout_planner")
    object HealthAnalysis : Screen("health_analysis")
    object AIAssistant : Screen("ai_assistant")
    object ProgressReports : Screen("progress_reports")
    object Profile : Screen("profile")
    object DietMeals : Screen("diet_meals")
    object PersonalDetails : Screen("personal_details")
    object Notifications : Screen("notifications")
    object PhysicalMetrics : Screen("physical_metrics")
    object ActivityHistory : Screen("activity_history")
    object ForgotPassword : Screen("forgot_password")
    object WorkoutLevel : Screen("workout_level")
    object GeneratedWorkoutPlan : Screen("generated_workout_plan/{goal}/{level}") {
        fun createRoute(goal: String, level: String) = "generated_workout_plan/$goal/$level"
    }
    object StatusDetail : Screen("status_detail/{statType}") {
        fun createRoute(statType: String) = "status_detail/$statType"
    }
    object MealDetails : Screen("meal_details/{mealName}") {
        fun createRoute(mealName: String) = "meal_details/$mealName"
    }
}