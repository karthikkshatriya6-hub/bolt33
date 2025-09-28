import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, Brain, Heart, Target,
  MessageCircle, Lightbulb, CheckCircle, ArrowRight,
  Clock, Award, TrendingUp, RefreshCw, Mic, MicOff,
  Settings, Download, Star, Plus, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  isAssessment?: boolean;
  assessmentData?: {
    questionNumber: number;
    totalQuestions: number;
    issue: string;
    currentQuestion: string;
    options?: string[];
  };
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple-choice' | 'scale';
  options?: string[];
  required: boolean;
}

interface TherapyPlan {
  issue: string;
  severity: string;
  planDuration: string;
  recommendations: Array<{
    moduleId: string;
    title: string;
    description: string;
    priority: number;
    color: string;
  }>;
  dailyGoals: string[];
  weeklyGoals: string[];
  expectedOutcomes: string[];
}

function ChatbotPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<{
    issue: string;
    questions: AssessmentQuestion[];
    currentQuestionIndex: number;
    answers: Record<string, string>;
    isActive: boolean;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mentalHealthIssues = [
    { id: 'anxiety', name: 'Anxiety Disorders', description: 'Excessive worry, panic attacks, social anxiety' },
    { id: 'depression', name: 'Depression', description: 'Persistent sadness, loss of interest, low energy' },
    { id: 'stress', name: 'Stress Management', description: 'Work stress, life transitions, overwhelm' },
    { id: 'trauma', name: 'Trauma & PTSD', description: 'Past traumatic experiences, flashbacks, nightmares' },
    { id: 'relationships', name: 'Relationship Issues', description: 'Communication problems, conflicts, boundaries' },
    { id: 'self-esteem', name: 'Self-Esteem', description: 'Low confidence, negative self-talk, self-worth' },
    { id: 'sleep', name: 'Sleep Disorders', description: 'Insomnia, sleep anxiety, irregular sleep patterns' },
    { id: 'addiction', name: 'Addiction Recovery', description: 'Substance abuse, behavioral addictions' },
    { id: 'grief', name: 'Grief & Loss', description: 'Bereavement, major life changes, loss processing' },
    { id: 'eating', name: 'Eating Disorders', description: 'Body image issues, disordered eating patterns' }
  ];

  const assessmentQuestions: Record<string, AssessmentQuestion[]> = {
    anxiety: [
      {
        id: 'anxiety_1',
        question: 'Can you describe a recent situation where you felt anxious? What was happening around you and what thoughts went through your mind?',
        type: 'text',
        required: true
      },
      {
        id: 'anxiety_2',
        question: 'How often do you experience anxiety symptoms?',
        type: 'multiple-choice',
        options: ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Rarely'],
        required: true
      },
      {
        id: 'anxiety_3',
        question: 'On a scale of 1-10, how would you rate your current anxiety level?',
        type: 'scale',
        required: true
      },
      {
        id: 'anxiety_4',
        question: 'What physical symptoms do you experience when anxious?',
        type: 'multiple-choice',
        options: ['Racing heart', 'Sweating', 'Trembling', 'Shortness of breath', 'Nausea', 'Dizziness', 'Muscle tension'],
        required: true
      },
      {
        id: 'anxiety_5',
        question: 'What situations or triggers tend to make your anxiety worse?',
        type: 'text',
        required: true
      },
      {
        id: 'anxiety_6',
        question: 'Have you tried any coping strategies before? What has worked or not worked for you?',
        type: 'text',
        required: false
      },
      {
        id: 'anxiety_7',
        question: 'How is your anxiety affecting your daily life (work, relationships, activities)?',
        type: 'text',
        required: true
      },
      {
        id: 'anxiety_8',
        question: 'Do you have any support systems in place (family, friends, professionals)?',
        type: 'text',
        required: false
      },
      {
        id: 'anxiety_9',
        question: 'What would you like to achieve through therapy?',
        type: 'text',
        required: true
      },
      {
        id: 'anxiety_10',
        question: 'Is there anything else about your anxiety that you think is important for me to know?',
        type: 'text',
        required: false
      }
    ],
    depression: [
      {
        id: 'depression_1',
        question: 'How long have you been feeling this way?',
        type: 'multiple-choice',
        options: ['Less than 2 weeks', '2-4 weeks', '1-3 months', '3-6 months', 'More than 6 months'],
        required: true
      },
      {
        id: 'depression_2',
        question: 'On a scale of 1-10, how would you rate your current mood?',
        type: 'scale',
        required: true
      },
      {
        id: 'depression_3',
        question: 'What symptoms are you experiencing?',
        type: 'multiple-choice',
        options: ['Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep problems', 'Appetite changes', 'Difficulty concentrating', 'Feelings of worthlessness'],
        required: true
      },
      {
        id: 'depression_4',
        question: 'Have you experienced any major life changes or stressful events recently?',
        type: 'text',
        required: true
      },
      {
        id: 'depression_5',
        question: 'How is this affecting your daily activities and relationships?',
        type: 'text',
        required: true
      },
      {
        id: 'depression_6',
        question: 'Do you have thoughts of self-harm or suicide?',
        type: 'multiple-choice',
        options: ['No, never', 'Rarely', 'Sometimes', 'Often', 'I need immediate help'],
        required: true
      },
      {
        id: 'depression_7',
        question: 'What activities used to bring you joy that you no longer enjoy?',
        type: 'text',
        required: false
      },
      {
        id: 'depression_8',
        question: 'What support do you have from family and friends?',
        type: 'text',
        required: false
      },
      {
        id: 'depression_9',
        question: 'What would help you feel better right now?',
        type: 'text',
        required: true
      },
      {
        id: 'depression_10',
        question: 'What are your goals for therapy?',
        type: 'text',
        required: true
      }
    ],
    stress: [
      {
        id: 'stress_1',
        question: 'What are the main sources of stress in your life right now?',
        type: 'text',
        required: true
      },
      {
        id: 'stress_2',
        question: 'How often do you feel overwhelmed?',
        type: 'multiple-choice',
        options: ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Rarely'],
        required: true
      },
      {
        id: 'stress_3',
        question: 'On a scale of 1-10, how would you rate your current stress level?',
        type: 'scale',
        required: true
      },
      {
        id: 'stress_4',
        question: 'How do you currently cope with stress?',
        type: 'text',
        required: true
      },
      {
        id: 'stress_5',
        question: 'What physical symptoms do you experience when stressed?',
        type: 'multiple-choice',
        options: ['Headaches', 'Muscle tension', 'Fatigue', 'Sleep problems', 'Digestive issues', 'Racing heart'],
        required: true
      },
      {
        id: 'stress_6',
        question: 'How is stress affecting your work or daily responsibilities?',
        type: 'text',
        required: true
      },
      {
        id: 'stress_7',
        question: 'Do you have time for relaxation and self-care?',
        type: 'multiple-choice',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Daily'],
        required: true
      },
      {
        id: 'stress_8',
        question: 'What would your ideal stress management routine look like?',
        type: 'text',
        required: false
      },
      {
        id: 'stress_9',
        question: 'What support do you need to better manage stress?',
        type: 'text',
        required: true
      },
      {
        id: 'stress_10',
        question: 'What would success in stress management look like for you?',
        type: 'text',
        required: true
      }
    ]
  };

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'bot',
      content: `Hello ${user?.name}! I'm your AI mental health assistant. I'm here to provide support, guidance, and help you on your wellness journey. How are you feeling today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content: string, type: 'user' | 'bot' | 'system', isAssessment = false, assessmentData?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isAssessment,
      assessmentData
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback: () => void, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const startAssessment = (issue: string) => {
    const questions = assessmentQuestions[issue] || assessmentQuestions.anxiety;
    
    setCurrentAssessment({
      issue,
      questions,
      currentQuestionIndex: 0,
      answers: {},
      isActive: true
    });

    // Add system message about starting assessment
    addMessage(
      `Great! I'll ask you some questions about ${mentalHealthIssues.find(i => i.id === issue)?.name.toLowerCase()} to create the best therapy plan for you. Let's begin:`,
      'bot'
    );

    // Ask first question
    setTimeout(() => {
      askCurrentQuestion();
    }, 1000);
  };

  const askCurrentQuestion = () => {
    if (!currentAssessment) return;

    const question = currentAssessment.questions[currentAssessment.currentQuestionIndex];
    const questionNumber = currentAssessment.currentQuestionIndex + 1;
    const totalQuestions = currentAssessment.questions.length;

    addMessage(
      question.question,
      'bot',
      true,
      {
        questionNumber,
        totalQuestions,
        issue: currentAssessment.issue,
        currentQuestion: question.question,
        options: question.options,
        type: question.type
      }
    );
  };

  const handleAssessmentAnswer = (answer: string) => {
    if (!currentAssessment) return;

    const question = currentAssessment.questions[currentAssessment.currentQuestionIndex];
    
    // Add user's answer to chat
    addMessage(answer, 'user');

    // Save the answer
    const updatedAssessment = {
      ...currentAssessment,
      answers: {
        ...currentAssessment.answers,
        [question.id]: answer
      }
    };

    // Move to next question or complete assessment
    if (currentAssessment.currentQuestionIndex < currentAssessment.questions.length - 1) {
      updatedAssessment.currentQuestionIndex += 1;
      setCurrentAssessment(updatedAssessment);
      
      // Ask next question after a brief delay
      setTimeout(() => {
        askCurrentQuestion();
      }, 1000);
    } else {
      // Assessment complete
      setCurrentAssessment(null);
      completeAssessment(updatedAssessment.answers, updatedAssessment.issue);
    }
  };

  const completeAssessment = (answers: Record<string, string>, issue: string) => {
    simulateTyping(() => {
      addMessage(
        'Thank you for completing the assessment! I\'m analyzing your responses to create a personalized therapy plan...',
        'bot'
      );
      
      setTimeout(() => {
        generateTherapyPlan(answers, issue);
      }, 2000);
    }, 1500);
  };

  const generateTherapyPlan = (answers: Record<string, string>, issue: string) => {
    const therapyPlan = createPersonalizedPlan(answers, issue);
    
    // Save the therapy plan
    const userProgress = {
      userId: user?.id,
      currentPlan: therapyPlan,
      startDate: new Date().toISOString(),
      completedTherapies: [],
      assessmentAnswers: answers
    };
    localStorage.setItem('mindcare_user_progress', JSON.stringify(userProgress));

    // Add therapy plan message
    const planMessage = `Based on your responses, I've created a personalized ${therapyPlan.planDuration} therapy plan for ${therapyPlan.issue}:

**Recommended Therapies:**
${therapyPlan.recommendations.map((rec, index) => `${index + 1}. ${rec.title} - ${rec.description}`).join('\n')}

**Daily Goals:**
${therapyPlan.dailyGoals.map(goal => `• ${goal}`).join('\n')}

**Expected Outcomes:**
${therapyPlan.expectedOutcomes.map(outcome => `• ${outcome}`).join('\n')}

You can start with any of the recommended therapies from the Therapies section. I'll be here to support you throughout your journey!`;

    addMessage(planMessage, 'bot');
    
    toast.success('Personalized therapy plan created!');
  };

  const createPersonalizedPlan = (answers: Record<string, string>, issue: string): TherapyPlan => {
    const issueData = mentalHealthIssues.find(i => i.id === issue);
    
    const basePlans: Record<string, Partial<TherapyPlan>> = {
      anxiety: {
        issue: 'Anxiety Management',
        planDuration: '8-week',
        recommendations: [
          { moduleId: 'mindfulness', title: 'Mindfulness & Breathing', description: 'Learn calming techniques', priority: 1, color: 'from-blue-500 to-cyan-500' },
          { moduleId: 'cbt', title: 'CBT Thought Records', description: 'Challenge anxious thoughts', priority: 2, color: 'from-purple-500 to-pink-500' },
          { moduleId: 'stress', title: 'Stress Management', description: 'Build coping strategies', priority: 3, color: 'from-teal-500 to-green-500' },
          { moduleId: 'exposure', title: 'Exposure Therapy', description: 'Gradual anxiety reduction', priority: 4, color: 'from-orange-500 to-red-500' }
        ],
        dailyGoals: [
          'Practice 10 minutes of mindful breathing',
          'Complete one thought record when anxious',
          'Use grounding techniques when overwhelmed'
        ],
        weeklyGoals: [
          'Complete 2-3 therapy modules',
          'Track anxiety patterns in mood tracker',
          'Practice one new coping strategy'
        ],
        expectedOutcomes: [
          'Reduced frequency and intensity of anxiety',
          'Better understanding of anxiety triggers',
          'Improved coping strategies',
          'Increased confidence in managing symptoms'
        ]
      },
      depression: {
        issue: 'Depression Support',
        planDuration: '12-week',
        recommendations: [
          { moduleId: 'cbt', title: 'CBT Thought Records', description: 'Address negative thinking', priority: 1, color: 'from-purple-500 to-pink-500' },
          { moduleId: 'gratitude', title: 'Gratitude Journal', description: 'Build positive mindset', priority: 2, color: 'from-green-500 to-teal-500' },
          { moduleId: 'mindfulness', title: 'Mindfulness Practice', description: 'Present moment awareness', priority: 3, color: 'from-blue-500 to-cyan-500' },
          { moduleId: 'video', title: 'Video Therapy', description: 'Professional guidance', priority: 4, color: 'from-blue-500 to-indigo-500' }
        ],
        dailyGoals: [
          'Write 3 things you\'re grateful for',
          'Complete one CBT thought record',
          'Engage in one pleasant activity'
        ],
        weeklyGoals: [
          'Complete 3-4 therapy modules',
          'Track mood daily',
          'Connect with support system'
        ],
        expectedOutcomes: [
          'Improved mood and energy levels',
          'More balanced thinking patterns',
          'Increased engagement in activities',
          'Better sleep and self-care habits'
        ]
      },
      stress: {
        issue: 'Stress Management',
        planDuration: '6-week',
        recommendations: [
          { moduleId: 'stress', title: 'Stress Management', description: 'Learn coping techniques', priority: 1, color: 'from-teal-500 to-green-500' },
          { moduleId: 'mindfulness', title: 'Mindfulness & Breathing', description: 'Relaxation practices', priority: 2, color: 'from-blue-500 to-cyan-500' },
          { moduleId: 'music', title: 'Relaxation Music', description: 'Audio-based stress relief', priority: 3, color: 'from-purple-500 to-blue-500' },
          { moduleId: 'tetris', title: 'Tetris Therapy', description: 'Gamified stress relief', priority: 4, color: 'from-cyan-500 to-blue-500' }
        ],
        dailyGoals: [
          'Practice stress reduction techniques',
          'Take regular breaks throughout the day',
          'Use relaxation music during stressful times'
        ],
        weeklyGoals: [
          'Complete 2-3 stress management modules',
          'Identify and address stress triggers',
          'Establish healthy boundaries'
        ],
        expectedOutcomes: [
          'Lower overall stress levels',
          'Better stress recognition and management',
          'Improved work-life balance',
          'Enhanced resilience to stressors'
        ]
      }
    };

    return {
      issue: issueData?.name || 'General Wellness',
      severity: 'Moderate', // Could be determined from assessment answers
      planDuration: '8-week',
      recommendations: [],
      dailyGoals: [],
      weeklyGoals: [],
      expectedOutcomes: [],
      ...basePlans[issue]
    } as TherapyPlan;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Check if we're in an assessment
    if (currentAssessment?.isActive) {
      handleAssessmentAnswer(inputMessage.trim());
      setInputMessage('');
      return;
    }

    addMessage(inputMessage, 'user');
    const userMessage = inputMessage.toLowerCase();
    setInputMessage('');

    // Check for assessment trigger
    if (userMessage.includes('assessment') || userMessage.includes('therapy plan') || userMessage.includes('help me')) {
      simulateTyping(() => {
        addMessage(
          'I can help you create a personalized therapy plan! First, let me know what you\'d like to work on. Please choose from the following options:',
          'bot'
        );
        
        setTimeout(() => {
          showIssueSelection();
        }, 500);
      });
      return;
    }

    // Generate contextual response
    simulateTyping(() => {
      const response = generateContextualResponse(userMessage);
      addMessage(response, 'bot');
    });
  };

  const showIssueSelection = () => {
    const issueMessage = `Please select the area you'd like to focus on:

${mentalHealthIssues.map((issue, index) => `${index + 1}. **${issue.name}** - ${issue.description}`).join('\n')}

Just type the number or name of the issue you'd like to work on.`;

    addMessage(issueMessage, 'bot');
  };

  const generateContextualResponse = (userMessage: string): string => {
    const responses = {
      greeting: [
        "Hello! I'm here to support you. How can I help you today?",
        "Hi there! What's on your mind?",
        "Welcome! I'm glad you're here. What would you like to talk about?"
      ],
      anxiety: [
        "I understand anxiety can be overwhelming. Would you like to try a quick breathing exercise, or shall we talk about what's making you anxious?",
        "Anxiety is very treatable. Let's work together to find strategies that help you feel more calm and in control.",
        "It's brave of you to reach out about anxiety. What specific situations tend to trigger your anxious feelings?"
      ],
      depression: [
        "I hear that you're struggling, and I want you to know that you're not alone. Depression is treatable, and there are many effective approaches we can explore.",
        "Thank you for sharing that with me. Depression can make everything feel harder, but there are ways to gradually feel better.",
        "It takes courage to talk about depression. What's been the most challenging part for you lately?"
      ],
      stress: [
        "Stress is a common experience, and there are many effective ways to manage it. What's been your biggest source of stress recently?",
        "Let's work on some stress management techniques. Would you like to start with breathing exercises or talk about what's causing your stress?",
        "Chronic stress can really impact your well-being. I'm here to help you develop better coping strategies."
      ],
      support: [
        "I'm here to listen and support you. Remember, seeking help is a sign of strength, not weakness.",
        "You're taking an important step by reaching out. What would be most helpful for you right now?",
        "I believe in your ability to overcome these challenges. Let's work together to find the right approach for you."
      ],
      default: [
        "That's interesting. Can you tell me more about how that makes you feel?",
        "I'm here to listen. What would you like to explore further?",
        "Thank you for sharing that with me. How has this been affecting you?",
        "I understand. What kind of support would be most helpful for you right now?"
      ]
    };

    // Check for issue selection (number or name)
    const issueMatch = mentalHealthIssues.find(issue => 
      userMessage.includes(issue.name.toLowerCase()) || 
      userMessage.includes(issue.id) ||
      mentalHealthIssues.findIndex(i => i.id === issue.id) + 1 === parseInt(userMessage)
    );

    if (issueMatch) {
      startAssessment(issueMatch.id);
      return `Perfect! You've selected ${issueMatch.name}. I'll now ask you some questions to better understand your situation and create a personalized therapy plan.`;
    }

    // Determine response category
    let category = 'default';
    if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      category = 'greeting';
    } else if (userMessage.includes('anxious') || userMessage.includes('anxiety') || userMessage.includes('worried')) {
      category = 'anxiety';
    } else if (userMessage.includes('sad') || userMessage.includes('depressed') || userMessage.includes('depression')) {
      category = 'depression';
    } else if (userMessage.includes('stress') || userMessage.includes('overwhelmed') || userMessage.includes('pressure')) {
      category = 'stress';
    } else if (userMessage.includes('help') || userMessage.includes('support') || userMessage.includes('guidance')) {
      category = 'support';
    }

    const categoryResponses = responses[category as keyof typeof responses] || responses.default;
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  const renderAssessmentQuestion = (message: Message) => {
    if (!message.assessmentData) return null;

    const { questionNumber, totalQuestions, type, options } = message.assessmentData;

    return (
      <div className={`mt-3 p-4 rounded-lg border ${
        theme === 'dark' ? 'border-purple-600 bg-purple-900/20' : 'border-purple-300 bg-purple-50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
          }`}>
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className={`w-full max-w-32 h-2 rounded-full ml-4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {type === 'multiple-choice' && options && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAssessmentAnswer(option)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}

        {type === 'scale' && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>1 (Low)</span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>10 (High)</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {[...Array(10)].map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAssessmentAnswer((index + 1).toString())}
                  className={`aspect-square rounded-lg border-2 font-bold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-purple-500 hover:bg-purple-900/50'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-500 hover:bg-purple-100'
                  }`}
                >
                  {index + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {type === 'text' && (
          <div className="mt-3">
            <p className={`text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Please type your answer in the message box below and press send.
            </p>
          </div>
        )}
      </div>
    );
  };

  const quickActions = [
    { text: 'Start Assessment', action: () => showIssueSelection() },
    { text: 'Breathing Exercise', action: () => addMessage('Let\'s do a quick breathing exercise. Breathe in for 4 counts, hold for 4, exhale for 4. Repeat 5 times.', 'bot') },
    { text: 'Mood Check', action: () => addMessage('How are you feeling right now on a scale of 1-10? What\'s contributing to that feeling?', 'bot') },
    { text: 'Coping Strategies', action: () => addMessage('Here are some quick coping strategies: 1) Take 5 deep breaths, 2) Name 5 things you can see, 3) Do some gentle stretching, 4) Listen to calming music. Which would you like to try?', 'bot') }
  ];

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                AI Mental Health Assistant
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your personal wellness companion
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full ${
              theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
            }`}>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                message.type === 'user' ? 'order-2' : 'order-1'
              }`}>
                <div className={`flex items-start space-x-2 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                      : 'bg-gradient-to-r from-teal-500 to-green-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-white text-gray-800 shadow-lg'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    {message.isAssessment && renderAssessmentQuestion(message)}
                    <div className={`text-xs mt-2 opacity-70`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-lg'
              }`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {!currentAssessment?.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-t ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {action.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Message Input */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                currentAssessment?.isActive 
                  ? "Type your answer here..." 
                  : "Type your message here..."
              }
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;