

const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// Check if the timestamp is today
const isToday = (timestampInMilliseconds: number) => {
    // Get the start and end milliseconds of today (00:00:00.000 to 23:59:59.999)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1
    return (
        startOfDay / 1000 <= timestampInMilliseconds && timestampInMilliseconds <= endOfDay / 1000
    )
}
// Check if the given time is in the future
const isFuture = (givenTimeString: string) => {
    const [hours, minutes] = givenTimeString.split(':').map(Number)
    // Create a Date object for the given time set to today's date
    const givenTime = new Date()
    givenTime.setHours(hours)
    givenTime.setMinutes(minutes)
    givenTime.setSeconds(0, 0) // Clear seconds and milliseconds
    // Get current time
    const currentTime = new Date()
    // Compare times
    return givenTime > currentTime
}



export { weekday, isToday, isFuture }
