/**
 * Database strategy - Norton 2021
 * Based on Mongoose.
 */


module.exports = function (mongoose, callback) {

    const CONNECTION_STRING = process.env.DB || "mongodb://localhost:27018/nortonQuiz";

    const quizQuestionSchema = mongoose.Schema({
      type: { type: String, required: true, default: 'single' },
      question: { type: String, required: true },
      choices: [{
        text: String,
        correct: Boolean
      }],
      imageLocation: String,
      answerTextRegex: String,
      answerEssayRegex: String
    })


    const quizSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true },
      questions: {type: [quizQuestionSchema], default: []},
      description: String,
      timeLimit: Number,
      maxAttempts: Number
    })

    const QuizModel = mongoose.model('Quiz', quizSchema);

    const userQuizQuestionSchema = mongoose.Schema({
      questionId: { type: String, required: true },
      answer: [Boolean],
      answerText: String,
      answerEssay: String,
      correct: Boolean
    })

    const userQuizSchema = mongoose.Schema({
      quizId: { type: String, required: true },
      quizName: { type: String, required: true },
      answers: [userQuizQuestionSchema],
      date: Date,
      score: Number
    })

    const userSchema = mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true },
      roles: {type: [String], default: ['student']},
      quizzes: {type: [userQuizSchema], default: []},
      firstname: String,
      surname: String
    })
    
    const UserModel = mongoose.model('User', userSchema);

    mongoose.connect(CONNECTION_STRING, { useMongoClient: true })
    .then(
      (db) => {
        callback(db);
      },
  
      (err) => {
          console.log('Database error: ' + err.message);
      }
    ); 

}