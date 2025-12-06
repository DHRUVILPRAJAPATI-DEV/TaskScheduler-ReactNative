# React Native Task Scheduler

A robust Task Scheduler mobile application built with **Expo** and **TypeScript**. This app allows users to create tasks with priorities, due dates, and notes, automatically sorting and grouping them by their status (Overdue, Today, Tomorrow, Upcoming).

## 📱 Features

* **Task Management:** Create, Edit, Delete, and Mark tasks as Done.
* **Smart Grouping:** Tasks are automatically categorized into *Overdue*, *Today*, *Tomorrow*, and *Upcoming* based on the current time.
* **Advanced Sorting:** Inside groups, tasks are sorted by:
    1.  Completion Status (Active first)
    2.  Priority (1-Highest to 5-Lowest)
    3.  Due Date (Earliest first)
    4.  Alphabetical Title
* **Search:** Real-time filtering of tasks by title.
* **Persistence:** All data is saved locally using AsyncStorage.
* **Clean UI:** Color-coded priorities and responsive layout handling safe areas on modern devices.

## 🎥 App Demo

To see the application in action (Sorting, Grouping, Persistence, and Validation), please watch the screen recording below:

**[▶️ Watch Screen Recording (Google Drive Link)](https://drive.google.com/file/d/1W3pS7WbqEu-p6fwDEV0dCqIcLLFCZF_W/view?usp=drivesdk)**

*(Note: The video demonstrates creating tasks, automatic sorting logic, editing, and app persistence)*

## 🚀 Steps to Run 

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/DHRUVILPRAJAPATI-DEV/TaskScheduler-ReactNative.git](https://github.com/DHRUVILPRAJAPATI-DEV/TaskScheduler-ReactNative.git)
    cd TaskScheduler-ReactNative
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the app:**
    ```bash
    npx expo start
    ```

4.  **Run on Device:**
    * Scan the QR code with the **Expo Go** app (Android/iOS).
    * Or press `a` to run on Android Emulator / `i` to run on iOS Simulator.

## 🛠 Libraries Used

* **react-native**: Core framework.
* **expo**: Development platform.
* **typescript**: Static typing.
* **@react-native-async-storage/async-storage**: For persisting data locally.
* **@react-native-community/datetimepicker**: Native date and time selection.
* **@expo/vector-icons**: Icons for UI (Ionicons).
* **react-native-safe-area-context**: Handling notches and navigation bars.
* **@react-navigation/native & native-stack**: Navigation between Home and Detail screens.

## 🧠 Sorting & Grouping Logic

The application uses a custom algorithm located in `src/utils/taskLogic.ts`:

1.  **Grouping:**
    * The app captures the current timestamp (`new Date()`) every minute.
    * Tasks due before "Now" are strictly categorized as **Overdue**.
    * Tasks due the rest of the current calendar day are **Today**.
    * Tasks due the next calendar day are **Tomorrow**.
    * Everything else is **Upcoming**.

2.  **Sorting:**
    Within each group, tasks are sorted using a multi-layer comparator:
    * **Level 1:** Completed tasks are pushed to the bottom.
    * **Level 2:** Higher Priority (lower number, e.g., 1) comes first.
    * **Level 3:** Earlier Due Date comes first.
    * **Level 4:** Alphabetical order by Title.

## ✨ Bonus Features Implemented

* **Edit Task Screen:** Users can modify existing tasks.
* **Search Bar:** Real-time filtering of the task list.
* **Priority Color Coding:** Visual indicators for priority (Red=Urgent, Green=Low).
* **Task Detail Screen:** A dedicated screen for viewing full task details and notes.
* **Pull-to-Refresh:** Manually trigger a check for overdue tasks.