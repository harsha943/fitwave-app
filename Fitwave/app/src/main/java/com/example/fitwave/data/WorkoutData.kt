package com.example.fitwave.data

import java.util.*

data class Workout(
    val name: String,
    val sets: String,
    val reps: String,
    val duration: String,
    val videoUrl: String
)

val weeklyWorkoutData = mapOf(
    "Mon" to listOf(
        Workout("Bench Press", "4 sets", "10-12 reps", "15 min", "https://www.youtube.com/watch?v=vcBig73ojpE"),
        Workout("Pushups", "3 sets", "Max reps", "10 min", "https://www.youtube.com/watch?v=IODxDxX7oi4"),
        Workout("Dumbbell Flyes", "3 sets", "12 reps", "10 min", "https://www.youtube.com/watch?v=eGjt4lk6g34")
    ),
    "Tue" to listOf(
        Workout("Deadlifts", "4 sets", "8 reps", "20 min", "https://www.youtube.com/watch?v=op9kVnSso6Q"),
        Workout("Pull-ups", "3 sets", "Max reps", "15 min", "https://www.youtube.com/watch?v=eGo4IYlbE5g"),
        Workout("Barbell Rows", "4 sets", "10 reps", "15 min", "https://www.youtube.com/watch?v=axoeDmW0oAY")
    ),
    "Wed" to listOf(
        Workout("Running", "1 set", "5km", "30 min", "https://www.youtube.com/watch?v=_kGESn8IpEo"),
        Workout("Plank", "3 sets", "1 min", "5 min", "https://www.youtube.com/watch?v=pSHjTRCQxIw")
    ),
    "Thu" to listOf(
        Workout("Squats", "4 sets", "10 reps", "20 min", "https://www.youtube.com/watch?v=gcNh17Ckjgg"),
        Workout("Leg Press", "3 sets", "12 reps", "15 min", "https://www.youtube.com/watch?v=IZxyjW7MPJQ"),
        Workout("Lunges", "3 sets", "15 reps/leg", "15 min", "https://www.youtube.com/watch?v=QOVaHwm-Q6U")
    ),
    "Fri" to listOf(
        Workout("Shoulder Press", "4 sets", "10 reps", "15 min", "https://www.youtube.com/watch?v=HzIiNhHhhtA"),
        Workout("Lateral Raises", "3 sets", "15 reps", "10 min", "https://www.youtube.com/watch?v=3VcKaXpzqRo"),
        Workout("Front Raises", "3 sets", "12 reps", "10 min", "https://www.youtube.com/watch?v=-t7fuZ0KhDA")
    ),
    "Sat" to listOf(
        Workout("Bicep Curls", "4 sets", "12 reps", "12 min", "https://www.youtube.com/watch?v=ykJmrZ5v0Oo"),
        Workout("Hammer Curls", "3 sets", "12 reps", "10 min", "https://www.youtube.com/watch?v=zC3nLlEvin4"),
        Workout("Tricep Dips", "4 sets", "15 reps", "12 min", "https://www.youtube.com/watch?v=6kALZikcLcM")
    ),
    "Sun" to emptyList<Workout>()
)

fun getCurrentDayName(): String {
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
