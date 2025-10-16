# Fight Tracker

A simple full-stack web app for athletes to **register, log in, and track fight sessions** (date, opponent, type, notes).  
Each athlete only sees their own sessions.

**Live App:** [https://fight-tracker.onrender.com](https://fight-tracker.onrender.com)  
**Backend API:** [https://fight-tracker-backend.onrender.com](https://fight-tracker-backend.onrender.com)  
**Repository:** [https://github.com/sevvalnr/fight-tracker](https://github.com/sevvalnr/fight-tracker)  
**Database:** 	PostgreSQL	Render Cloud Instance



---

##  Tech Stack

- **Frontend:** React ,Axios  
- **Backend:** Node.js, Express, bcryptjs, JWT  
- **Database:** PostgreSQL (Render Cloud)  
- **Deployment:** Render (Frontend, Backend & PostgreSQL)  
- **Security:** CORS whitelist, token-based auth, password hashing  

---

##  Database
CREATE TABLE public.fight_logs (
    id integer NOT NULL DEFAULT nextval('fight_logs_id_seq'::regclass),
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    fight_date timestamp without time zone NOT NULL,
    opponent_name character varying(255) NOT NULL,
    fight_type character varying(100) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fight_logs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.users (
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email character varying(255) NOT NULL UNIQUE,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);


##  Deployment (Render)
 
Component	Type	URL
Frontend	Web Service	https://fight-tracker.onrender.com
Backend	Web Service	https://fight-tracker-backend.onrender.com
Database	PostgreSQL	Render Cloud Instance

##  Setup Instructions

###  Clone the repository
```bash
git clone https://github.com/sevvalnr/fight-tracker.git
cd fight-tracker
cd backend
npm install

cd ../frontend
npm install
npm start

Tables are created automatically on startup by initDB() in db.js.
No external migration tool is required.

