import React, { useContext } from 'react';
import Header from '../../components/Header/Header';
import Notification from '../../components/Notification/Notification';
import { AppContext } from '../../contexts/AppContext';
import './JobQueue.scss';


const JobQueue = () => {

  const { 
    showNotification,
    setShowNotification,
    notificationData,
  } = useContext(AppContext);


  return(
    <div className="job-queue">

      <Header />

      {/* notification placeholder container */}
      { showNotification &&
        (<div className="job-queue-notification-container">
          <Notification 
            type={notificationData.type}
            message={notificationData.message}
            onClose={() => setShowNotification(false)}
            duration={notificationData.duration} // auto-close after 5 seconds (optional)
          />
        </div>)
      }

    </div>
  );
};

export default JobQueue;