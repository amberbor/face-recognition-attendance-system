import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroundImage from '../wallpaper4.jpg';
const URL = "http://localhost:5000"


const Main = () => {

  const [today, setToday] = useState('');
  const [userDetails, setUserDetails] = useState([]);
  const [totalreg, setTotalReg] = useState(0);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    const response = await fetch(`${URL}/`);
    const data = await response.json();
    setToday(data.data.today.replace("_", "-"));
    setUserDetails(data.data.userDetails);
    setTotalReg(data.data.totalreg);
  };

  const handleTakeAttendance = async () => {
    try {
      await fetch(`${URL}/video_feed`, { method: 'GET' });
      fetchUserDetails();
    } catch (error) {
      console.error('Error taking attendance:', error);
    }
  };

const handleAddUser = async () => {
  const newUserName = document.getElementById('newusername').value;
  const email = document.getElementById('email').value;

  const formData = new URLSearchParams();
  formData.append('newusername', newUserName);
  formData.append('email', email);

  try {
    const response = await fetch(`${URL}/add_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (response.ok) {
      fetchUserDetails(); // Refresh user details after adding a user
    } else {
      console.error('Failed to add a new user');
    }
  } catch (error) {
    console.error('Error adding a new user:', error);
  }
};

  return (
    <>
            <style>
        {`
          * {
            padding: 0;
            margin: 0;
            font-family: 'Helvetica';
          }

          body {
            background-image: url('${backgroundImage}');
            background-size: cover;
            font-family: Helvetica;
            margin-top: 40px;
            height: 100vh;
            padding: 0;
            margin: 0;
          }

          table {
            border: 1px;
            font-family: Helvetica;
            border-collapse: collapse;
            width: 86%;
            margin: auto;
          }

          td,
          th {
            border: 1px solid black !important;
            padding: 5px;
          }

          tr:nth-child(even) {
            background-color: #dddddd;
          }
        `}
      </style>
      <div className='mt-3 text-center'>
        <h1 style={{ width: 'auto', margin: 'auto', color: 'white', padding: '11px', fontSize: '44px' }}>
          Attendance System
        </h1>
      </div>

      <div className='mt-3 text-center'>
        <h3 style={{ fontSize: '22px', color: 'beige' }}>{today} | <span id='clock'></span></h3>
      </div>

      <div className='row text-center' style={{ padding: '20px', margin: '20px' }}>
        <div className='col' style={{ borderRadius: '20px', padding: '0px', backgroundColor: 'rgba(211,211,211,0.5)', margin: '0px 10px 10px 10px', minHeight: '400px' }}>
          <h2 style={{ borderRadius: '20px 20px 0px 0px', backgroundColor: '#424649', color: 'white', padding: '10px' }}>
            Today's Attendance
          </h2>

          <table style={{ backgroundColor: 'white' }}>
            <tr>
              <td><b>ID</b></td>
              <td><b>Name</b></td>
              <td><b>Email</b></td>
              <td><b>Time</b></td>
            </tr>
            {userDetails.map((user, index) => (
              <tr key={index}>
                <td>{user[1]}</td>
                <td>{user[0]}</td>
                <td>{user[2]}</td>
                <td>{user[3]}</td>
              </tr>
            ))}
          </table>
          <a style={{ width: '232px' }} href='/video_feed'>
            <button
              style={{ fontSize: '24px', fontWeight: 'bold', borderRadius: '10px', width: '232px', padding: '10px', marginTop: '30px', marginBottom: '30px' }}
              type='submit' className='btn btn-dark' onClick={handleTakeAttendance}>
              Take Attendance <i className='material-icons'></i>
            </button>
          </a>
        </div>

        <div className='col' style={{ borderRadius: '20px', padding: '0px', backgroundColor: 'rgba(211,211,211,0.5)', margin: '0px 10px 10px 10px', height: '400px' }}>
          <div>
            <h2 style={{ borderRadius: '20px 20px 0px 0px', backgroundColor: '#424649', color: 'white', padding: '10px' }}>
              Add New User <i className='material-icons'></i>
            </h2>
            <label style={{ fontSize: '20px' }}><b>Enter New User Name*</b></label>
            <br />
            <input type='text' id='newusername' name='newusername' style={{ fontSize: '20px', marginTop: '10px', marginBottom: '10px' }} required />
            <br />
            <label style={{ fontSize: '20px' }}><b>Enter Email*</b></label>
            <br />
            <input type='text' id='email' name='email' style={{ fontSize: '20px', marginTop: '10px', marginBottom: '10px' }} required />
            <br />
            <button style={{ width: '232px', marginTop: '20px', fontSize: '20px' }} type='submit' className='btn btn-dark' onClick={handleAddUser}>
              Add New User
            </button>
            <br />
            {/*<h5 style={{ padding: '25px' }}><i>Total Users in Database: {totalreg}</i></h5>*/}
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
