
exports.newAverageRating = (book) => {
  const allCurrentGrades = book.ratings.map(rating => rating.grade)
  const newAverage = allCurrentGrades.reduce((acc, rating) => acc + rating) / allCurrentGrades.length

  book.averageRating = newAverage

  return book
}

