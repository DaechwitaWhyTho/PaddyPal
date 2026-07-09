\#  OnnoProhori



\## AI-Powered Rice Disease Detection \& Agricultural Assistance Platform



OnnoProhori is an AI-powered agricultural platform built to help rice farmers identify plant diseases and get meaningful guidance at an early stage.



By combining \*\*computer vision, deep learning, and agricultural knowledge, OnnoProhori analyzes rice leaf images, detects potential diseases, and provides useful insights to support better crop management decisions.



The goal of OnnoProhori is simple: making modern AI technology accessible to farmers and helping them protect their crops through faster and smarter disease detection.



\---



\#  Overview



Rice diseases are one of the biggest challenges in agriculture, often leading to reduced crop yield and financial losses. However, identifying diseases at an early stage can be difficult due to limited access to agricultural experts and diagnostic resources.



OnnoProhori aims to solve this problem by providing a digital assistant where farmers can upload images of rice leaves and receive AI-generated disease predictions along with confidence scores.



The platform combines:



\*  AI-powered image analysis

\*  Agricultural disease knowledge

\*  Modern web technologies

\*  Recommendation-based support



to provide an easy-to-use solution for rice disease monitoring and management.



\---



\#  Features



\##  User Features



\* Secure user registration and authentication

\* User-friendly web interface

\* Rice leaf image upload

\* AI-based disease detection

\* Disease classification with confidence score

\* Clear visualization of diagnosis results

\* Agricultural guidance and recommendations in Bangla

\* Easy access for farmers and agricultural users



\---



\#  AI Disease Detection Module



The core intelligence of OnnoProhori comes from its AI-based disease detection module.



The system analyzes rice leaf images using deep learning and computer vision techniques to identify possible diseases and generate prediction results.



\### AI Capabilities



\* Rice leaf image-based disease detection

\* Deep learning-based classification

\* Confidence score prediction

\* Automated disease identification

\* Backend API integration for real-time analysis



The AI module is designed to support early disease detection and assist farmers in making informed crop management decisions.



\---



\#  System Architecture



```

&#x20;                Farmer

&#x20;                   |

&#x20;                   |

&#x20;         OnnoProhori Application

&#x20;                   |

&#x20;       ----------------------------

&#x20;       |                          |

&#x20;React Frontend              Backend API

&#x20;       |                          |

&#x20;       |                    Authentication

&#x20;       |                          |

&#x20;       |                    PostgreSQL DB

&#x20;       |

&#x20;       |

&#x20;       ↓



&#x20;  AI Disease Detection Engine

&#x20;             |

&#x20;  Rice Leaf Image Processing

&#x20;             |

&#x20;  Disease Prediction Result

&#x20;             |

&#x20;             ↓

&#x20;  Recommendation System

&#x20;             |

&#x20;             ↓

&#x20;   	Farmer Guidance

```



\---



\#  Technology Stack



\## Frontend



\* React

\* Vite

\* React Router

\* Axios

\* Responsive UI Components



\## Backend



\* Node.js

\* Express.js

\* JWT-based Authentication

\* bcrypt Password Hashing

\* Multer Image Upload Handling

\* Helmet Security Middleware

\* Morgan Request Logging



\## Database



\* PostgreSQL

\* Neon Serverless PostgreSQL



\## AI \& Machine Learning



\* Deep learning-based image classification

\* Computer vision techniques

\* Rice disease prediction model

\* API-based AI model integration



\---



\#  Project Structure



```

PaddyPal/

│

├── client/                    

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── context/

│   │   └── services/

│   │

│   └── package.json

│

├── server/

│   ├── authController.js

│   ├── authRoutes.js

│   ├── db.js

│   ├── aiClient.js

│   └── index.js

│

├── model/

│   ├── trained model files

│   ├── inference pipeline

│   └── AI resources

│

└── README.md

```



\---



\#  Installation \& Setup



\## Clone the Repository



```bash

git clone https://github.com/DaechwitaWhyTho/PaddyPal.git



cd PaddyPal

```



\---



\## Frontend Setup



```bash

cd client



npm install



npm run dev

```



\---



\## Backend Setup



```bash

cd server



npm install

```



Create a `.env` file:



```

DATABASE\_URL=your\_database\_url



JWT\_SECRET=your\_secret\_key



AI\_MODEL\_URL=your\_model\_api\_url

```



Start the backend server:



```bash

npm start

```



\---



\#  AI Prediction Workflow



```

Rice Leaf Image Upload



&#x20;         ↓



Image Preprocessing



&#x20;         ↓



AI Disease Detection Model



&#x20;         ↓



Disease Classification



&#x20;         ↓



Confidence Score Generation



&#x20;         ↓



Recommendation Processing



&#x20;         ↓



Farmer Guidance

```



\---



\#  Future Improvements



Future versions of OnnoProhori will focus on improving accuracy, accessibility, and farmer support through:



\* Expanding rice disease classification capabilities

\* Integrating Bangladesh-specific rice disease datasets

\* Adding disease severity estimation

\* Incorporating weather-based disease risk analysis

\* Developing mobile application support

\* Enabling offline AI assistance for rural areas

\* Improving personalized agricultural recommendations



\---



\#  Mission



The mission of \*\*OnnoProhori\*\* is to connect artificial intelligence with agriculture and empower farmers with accessible technology for early disease detection, better decision-making, and improved crop productivity.



\---



\#  License



MIT License



