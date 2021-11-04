/**
 * Database strategy - Norton 2021
 * Based on Mongoose.
 */


module.exports = function (mongoose, callback) {

    const CONNECTION_STRING = process.env.DB;

    const quizQuestionSchema = mongoose.Schema({
      type: { type: String, required: true, default: 'multi' },
      question: { type: String, required: true },
      choices: [{
        text: String,
        correct: Boolean
      }],
      imageLocation: String
    })


    const quizSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true },
      questions: {type: [quizQuestionSchema], default: []},
      decription: String
    })

    const QuizModel = mongoose.model('Quiz', quizSchema);

    const userQuizQuestionSchema = mongoose.Schema({
      questionId: { type: String, required: true },
      answer: [Boolean],
      correct: Boolean
    })

    const userQuizSchema = mongoose.Schema({
      quizId: { type: String, required: true },
      answers: [userQuizQuestionSchema],
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