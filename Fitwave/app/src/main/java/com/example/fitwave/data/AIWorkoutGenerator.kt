package com.example.fitwave.data

class AIWorkoutGenerator {
    fun generatePlan(goal: String, level: String, age: Int, weight: Double): List<Workout> {
        val multiplier = when {
            age > 50 -> 0.8
            age < 20 -> 1.1
            else -> 1.0
        }

        val weightFactor = when {
            weight > 100 -> 0.9 // Lower impact/intensity for higher weight to protect joints
            weight < 60 -> 1.1
            else -> 1.0
        }

        return when (goal) {
            "Weight Loss" -> when (level) {
                "Beginner" -> listOf(
                    Workout("Brisk Walking", "1 set", "${(20 * multiplier).toInt()} min", "20 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Jumping Jacks", "${(3 * weightFactor).toInt()} sets", "15 reps", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Bodyweight Squats", "3 sets", "${(10 * multiplier).toInt()} reps", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
                "Intermediate" -> listOf(
                    Workout("Jogging", "1 set", "${(30 * multiplier).toInt()} min", "30 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Burpees", "4 sets", "${(15 * weightFactor).toInt()} reps", "15 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Mountain Climbers", "4 sets", "20 reps", "12 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
                "Advanced" -> listOf(
                    Workout("High Intensity Running", "1 set", "40 min", "40 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Sprints", "10 sets", "100m", "20 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Battle Ropes", "5 sets", "1 min", "15 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
                else -> listOf(
                    Workout("Walking", "1 set", "20 min", "20 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
            }
            "Muscle Gain" -> when (level) {
                "Beginner" -> listOf(
                    Workout("Push Ups", "3 sets", "${(10 * multiplier).toInt()} reps", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Dumbbell Curls", "3 sets", "12 reps", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Goblet Squats", "3 sets", "12 reps", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
                "Intermediate" -> listOf(
                    Workout("Bench Press", "4 sets", "10 reps", "15 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Deadlifts", "4 sets", "8 reps", "20 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Pull Ups", "4 sets", "8 reps", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
                "Advanced" -> listOf(
                    Workout("Barbell Squats", "5 sets", "5 reps", "25 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Weighted Pull Ups", "4 sets", "6 reps", "15 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                    Workout("Overhead Press", "5 sets", "5 reps", "20 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
                else -> listOf(
                    Workout("Push Ups", "2 sets", "10 reps", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
                )
            }
            "Yoga" -> listOf(
                Workout("Sun Salutation", "5 rounds", "N/A", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                Workout("Warrior I & II", "3 sets", "30 sec hold", "10 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                Workout("Tree Pose", "2 sets", "45 sec each", "5 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                Workout("Child's Pose", "1 set", "2 min", "2 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
            )
            "HIIT" -> listOf(
                Workout("High Knees", "4 sets", "45 sec", "5 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                Workout("Plank Jacks", "4 sets", "45 sec", "5 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                Workout("Box Jumps", "4 sets", "12 reps", "8 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                Workout("Rest", "1 set", "1 min", "1 min", "N/A")
            )
            else -> listOf(
                Workout("Walking", "1 set", "45 min", "45 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
                Workout("Stretching", "1 set", "15 min", "15 min", "https://www.youtube.com/watch?v=vcBig73ojpE")
            )
        }
    }
}

