import React, { useContext, useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Notification from '../../components/Notification/Notification';
import DataTable from '../../components/DataTable/DataTable';
import Dropdown from '../../components/Dropdown/Dropdown';
import Button from '../../components/Button/Button';
import { AppContext } from '../../contexts/AppContext';
import { getUserDetail } from '../../utils/userUtils';
import { getMyJobs, getAllJobs } from '../../services/jobServices';
import './JobQueue.scss';


const JobQueue = () => {

  const {
    showNotification,
    setShowNotification,
    notificationData,
    setNotificationData,
  } = useContext(AppContext);

  // NOTE: the drop down is only displayed if the user has admin role
  const dropdownOptions = [
    { value: 'my-jobs', label: 'My Jobs' },
    { value: 'all-jobs', label: 'All Jobs' },
  ]

  const [activeUser, setActiveUser] = useState({ username: '', token: '', role: '' });
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);  // default to My Job
  const [dataRows, setDataRows] = useState([]);


  // on page load - check token and fetch my jobs by default
  useEffect(() => {
    const token = localStorage.getItem('jwtToken')

    // get the active user's username
    const username = getUserDetail(token, 'username');
    const role = getUserDetail(token, 'role');
    if (username) {
      setActiveUser({ username: username, token: token, role: role });
    }

    // call get my jobs endpoint
    handleGetMyJobs(token);
  }, []);


  // -- API service calls

  // handle get user's jobs
  const handleGetMyJobs = async (token) => {
    try {
      // GET active user's jobs
      var response = await getMyJobs(token);

      // handle success
      if (response) {
        // prep the returned data into rows
        const data = prepTableRows(response);
        // set setDataRows
        setDataRows(data);
      }
    } catch (error) {
      console.error(error);
      // error notification
      setNotificationData({
        type: "error",
        message: `${error.message}`,
      });
      setShowNotification(true);
    }
  };

  // handle get all jobs
  const handleGetAllJobs = async () => {
    try {
      // GET all jobs
      var response = await getAllJobs(activeUser.token);

      // handle success
      if (response) {
        // prep the returned data into rows
        const data = prepTableRows(response);
        // set setDataRows
        setDataRows(data);
      }
    } catch (error) {
      console.error(error);
      // error notification
      setNotificationData({
        type: "error",
        message: `${error.message}`,
      });
      setShowNotification(true);
    }
  };


  // -- component handling

  // handle view selection from dropdown
  const handleViewDropdownOption = (value) => {

    // call associated API call 
    if (value === 'all-jobs') {
      // if the user is not an admin, do not allow
      // NOTE: this is an extra check since non-admins should not have the dropdown
      if (activeUser.role !== 'admin') {
        return
      }
      // call get my jobs endpoint
      handleGetAllJobs(activeUser.token);
    }
    if (value === 'my-jobs') {
      // call get my jobs endpoint
      handleGetMyJobs(activeUser.token);
    } 

    // set the selected option in state
    setSelectedOption(dropdownOptions.find(option => option.value === value));
  };

  // handle download for OutputResults button
  // NOTE: i dont have the correct permissions to get access to the actual
  // blob storage, but the error notification handles this gracefully
  const handleDownload = async (downloadURL) => {
    try {
      const response = await fetch(downloadURL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
    
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output_result.gpkg');
      document.body.appendChild(link);
      link.click();
      link.remove();
    
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setNotificationData({
        type: "error",
        message: `File couldn't be downloaded. ${error.message}`,
      });
      setShowNotification(true);
    }
  };

  // format text from snake_case to Capitalised And Spaces
  const formatText = (text) => {
    if (!text) return ""; // handle null/undefined
    return text
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // preparing the row data from the api response
  const prepTableRows = (responseData) => {

    return responseData.results.map((job) => (
      {
        id: job.job_id,
        workflowType: formatText(job.workflow_type),
        user: job.user,
        startTime: job.start_time,
        duration: job.duration,
        progress: job.progress,
        status: formatText(job.status),
        details: job.details,
      }
    ))
  };

  // define columns
  const columns = [
    { field: 'id', headerName: 'Job ID', type: 'string', width: 100 },
    { field: 'workflowType', headerName: 'Workflow Type', type: 'string', width: 175 },
    { field: 'user', headerName: 'User', type: 'string', width: 240 },
    {
      field: 'startTime',
      headerName: 'Start Time',
      type: 'string',
      width: 200,
    },
    {
      field: 'duration',
      headerName: 'Duration',
      type: 'string',
      width: 150,
    },
    {
      field: 'progress',
      headerName: 'Progress',
      type: 'string',
      width: 100,
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'string',
      width: 100,
    },
    {
      field: 'details',
      headerName: 'Details',
      sortable: false,
      minWidth: 150,
      width: 650,
      renderCell: (params) => {
        const data = params.value;
        if (!data) return '';
        return (
          <div>
            {data.errorMessage && <div>{formatText(data.errorMessage)}</div>}
            {data.OutputResult && 
              <Button 
              title={'Download'}
              color={'#a9c7d2'}
              textColor={'#18424E'}
              onClick={() => handleDownload(data.OutputResult)}
            />
            }
          </div>
        );
      },
    },
  ];


  return(
    <div className="job-queue">

      <Header 
        username={activeUser.username}
      />

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

      <div className="job-queue-heading-container">
        <div className="heading">{selectedOption.label}</div>

        {/* views dropdown only valid for admin users */}
        {activeUser.role === 'admin' &&
          <div className="view-selection-container">
            <div className="view-selection-container-label">VIEW:</div>
            <Dropdown 
              options={dropdownOptions}
              value={selectedOption}
              onChange={(newOption) => handleViewDropdownOption(newOption?.value)}
              isClearable={false}
              isSearchable={false}
            />
          </div>
        }
      </div>

      <div className="job-queue-table-container">
        <DataTable 
          columns={columns}
          rows={dataRows}
          rowsPerPage={10}
        />
      </div>
    </div>
  );
};

export default JobQueue;