import React, { useContext, useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Notification from '../../components/Notification/Notification';
import DataTable from '../../components/DataTable/DataTable';
import Dropdown from '../../components/Dropdown/Dropdown';
import { AppContext } from '../../contexts/AppContext';
import { getUserDetail } from '../../utils/userUtils';
import { getMyJobs } from '../../services/jobServices';
import './JobQueue.scss';


const JobQueue = () => {

  const {
    showNotification,
    setShowNotification,
    notificationData,
  } = useContext(AppContext);

  // NOTE: the drop down is only displayed if the user has admin role
  const dropdownOptions = [
    { value: 'my-jobs', label: 'My Jobs' },
    { value: 'all-jobs', label: 'All Jobs' },
  ]

  const [activeUser, setActiveUser] = useState({ username: '', token: '', role: '' });  // default to My Job
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);  // default to My Job
  // const [dataColumns, setDataColumns] = useState([]);
  // const [dataRows, setDataRows] = useState([]);

  // shouldnt need to redriect the user from this page since the route is protected
  // just get the user details from the token to pass to the API
  useEffect(() => {
    const token = localStorage.getItem('jwtToken')

    // get the active user's username
    const username = getUserDetail(token, 'username');
    const role = getUserDetail(token, 'role');
    if (username) {
      setActiveUser({ username: username, token: token, role: role });
    }

    // call get my jobs endpoint and pass username directly incase setActiveUsername hasnt completed
    handleGetMyJobs(token);
  }, []);

  // handle get user's jobs
  const handleGetMyJobs = async (token) => {
    try {

      // TODO - needs spinner?

      // GET active user's jobs
      var response = await getMyJobs(token);

      // handle success
      if (response) {
        console.log('response: ', response)

        // TODO: call function to prep the returned data into 'rows'
        // prepTableRows(response);

        // // close spinner
        // setShowSpinner(false)
      }
    } catch (error) {
      console.error(error);
      // error notification
      // TODO - if the users token is invalid/expired => trigger logout
    }
  };


  // handle get all jobs
  // const handleGetAllJobs = async () => {
  //   try {

  //     // TODO - needs spinner?

  //     // GET active user's jobs
  //     var response = await getMyJobs(activeUser.token, activeUser.username);

  //     // handle success
  //     if (response) {
  //       console.log('response: ', response)

  //       // call function to prep the returned data into 'rows'

  //       // // close spinner
  //       // setShowSpinner(false)
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     // error notification
  //   }
  // };



  // handle view selection from dropdown
  const handleViewDropdownOption = (selectedOption) => {
    // set the selected option
    // setSelectedOption(selectedOption);

    // call associated API call 
    if (selectedOption === 'my-jobs') {
      // call get my jobs endpoint
      handleGetMyJobs(activeUser.token);
    } 
    // if (selectedOption === 'all-jobs') {
    //    // TODO: extra check that they have role === admin else no call to endpoint
    //   // call get my jobs endpoint
    //   handleGetAllJobs(activeUser.token);
    // }
  };



  // TEST data
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First name', width: 130 },
    { field: 'lastName', headerName: 'Last name', width: 130 },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 90,
    },
    {
      field: 'fullName',
      headerName: 'Full name',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
  ];
  
  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
  ];


  return(
    <div className="job-queue">

      {/* TODO: pass the activeUser.username to the header for the icon hover? */}
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

      <div className="job-queue-heading-container">
        <div className="heading">MY JOBS</div>

        {/* views dropdown only valid for admin users */}
        {activeUser.role === 'admin' &&
          <div className="view-selection-container">
            <div className="view-selection-container-label">VIEW:</div>
            <Dropdown 
              options={dropdownOptions}
              value={selectedOption}
              onChange={setSelectedOption}
              isClearable={false}
              isSearchable={false}
            />
          </div>
        }
        
      </div>

      <div className="job-queue-table-container">
        <DataTable 
          columns={columns}
          rows={rows}
        />
      </div>

    </div>
  );
};

export default JobQueue;