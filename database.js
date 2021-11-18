/**
 * Database strategy - Norton 2021
 * Based on Mongoose.
 */


module.exports = function (mongoose, callback) {

    const CONNECTION_STRING = process.env.DB || "mongodb://localhost:27018/quiZap";

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
      name: { type: String, required: true },
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
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      roles: {type: [String], default: ['student']},
      quizzes: {type: [userQuizSchema], default: []},
      firstname: String,
      surname: String
    })
    
    const UserModel = mongoose.model('User', userSchema);

    const replySchema = mongoose.Schema({
      text: { type: String, required: true },
      created_on: Date,
      author: { type: String, required: true },
      reported: { type: Boolean, default: false }
    })
  
    const ReplyModel = mongoose.model('Reply', replySchema);

    const threadSchema = mongoose.Schema({
      courseId: { type: String, required: true }, 
      text: { type: String, required: true },
      created_on: Date,
      bumped_on: Date,
      status: String,
      author: { type: String, required: true },
      reported: { type: Boolean, default: false },
      replies: {type: [replySchema], default: []}
    })

    const ThreadModel = mongoose.model('Thread', threadSchema);

    const courseSchema = mongoose.Schema({
      name: { type: String, required: true, unique: true },
      homeContent: String,
      description: String,
      instructors: [{
        instructorId: String,
        instructorName: String
      }],
      studentIds: [String],
      quizIds: [{
        quizId: String,
        sortKey: Number
      }]
    })

    const CourseModel = mongoose.model('Course', courseSchema);

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