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
      }]
    })

    const quizSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true },
      questions: {type: [quizQuestionSchema], default: []}
    })

    const QuizModel = mongoose.model('Quiz', quizSchema);

    // TODO: ASSUMING MULTIPLE CHOICE WITH ONE CORRECT ANSWER FOR NOW
    const userQuizQuestionSchema = mongoose.Schema({
      quizQuestionId: { type: String, required: true },
      myAnswer: String,
      correct: Boolean
    })

    const userQuizSchema = mongoose.Schema({
      quizName: { type: String, required: true },
      questions: [userQuizQuestionSchema]
    })
    
    const userSchema = mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true },
      roles: {type: [String], default: ['student']},
      quizzes: {type: [userQuizSchema], default: []}
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