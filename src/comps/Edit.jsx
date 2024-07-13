import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getDoc,
  getDocs,
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  ref,
  deleteObject,
} from 'firebase/storage';
import {db} from '../firebase/firebase';

function Edit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    address: '',
    contact: '',
    email: '',
    DOB: '',
    qualifications: [],
  });
  const [progress, setProgress] = useState(0);
  const [imgFile, setImgFile] = useState();
  const [resumeFile, setResumeFile] = useState();
  const [imgURL, setImgUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isResumeUpdated, setIsResumeUpdated] = useState(false);
  const [getUser, setGetUser] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'user'));
        const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGetUser(userList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setIsResumeUpdated(false);
  }, [resumeFile]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "user", id));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setImgUrl(userDoc.data().img);
          setResumeUrl(userDoc.data().resume);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    

    fetchData();
  }, [id]);

  const addField = (e) => {
    e.preventDefault();
    setUserData((prevData) => ({
      ...prevData,
      qualifications: [...prevData.qualifications, { qualification: '' }],
    }));
  };

  const removeField = (index, e) => {
    e.preventDefault();
    let updatedQualifications = [...userData.qualifications];
    updatedQualifications.splice(index, 1);
    setUserData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  const handleChangeDynamic = (index, event) => {
    const { name, value } = event.target;
    const updatedQualifications = [...userData.qualifications];
    updatedQualifications[index] = {
      ...updatedQualifications[index],
      [name]: value,
    };
    setUserData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  const handleChange = (e) => {
    if (e.target.name === 'img' || e.target.name === 'resume') {
      return;
    }
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageRemove = () => {
    setImgFile(null);
    setImgUrl('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageURL = imgURL;
      let resumeURL = resumeUrl;

      if (imgFile) {
        imageURL = await uploadFile('images', imgFile, id);
        setImgUrl(imageURL);
      }

      if (resumeFile) {
        resumeURL = await uploadFile('resumes', resumeFile, id);
        setResumeUrl(resumeURL);
      }

      setUserData((prev) => ({
        ...prev,
        img: imageURL,
        resume: resumeURL,
      }));

      const dataRef = doc(db, 'user', id);

      await updateDoc(dataRef, {
        img: imageURL,
        resume: resumeURL,
        name: userData.name,
        address: userData.address,
        contact: userData.contact,
        email: userData.email,
        DOB: userData.DOB,
        qualifications: userData.qualifications,
      });

      console.log('document updated');
      window.alert('Updated the data');
      setIsUploading(false);
      navigate(`/view`);
    } catch (error) {
      console.error('Error updating document: ', error.message);
    }
  };

  const uploadFile = async (folderName, file, userId) => {
    const storageRef = ref(getStorage(), `${folderName}/${userId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          console.error(error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setProgress(0);
              resolve(downloadURL);
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  };

  return (
    <>
      <div className="createHome">
        <form onSubmit={(e) => handleUpdate(e)}>
          <div className="create-outbox">
            <div className="inputFields">
              <div className="inputdiv">
                <label htmlFor="Name" className="createlabel">Name: </label>
                <input
                  className="createInput"
                  name="name"
                  type="text"
                  id="Name"
                  value={userData.name}
                  onChange={handleChange}
                  autoComplete="no"
                />
              </div>

              <div>
                <label htmlFor="Address" className="createlabel">Address: </label>
                <input
                  className="createInput"
                  name="address"
                  type="text"
                  id="Address"
                  value={userData.address}
                  onChange={handleChange}
                  autoComplete="no"
                />
              </div>

              <div>
                <label htmlFor="Contact" className="createlabel">Contact: </label>
                <input
                  className="createInput"
                  name="contact"
                  type="text"
                  id="Contact"
                  value={userData.contact}
                  onChange={handleChange}
                  autoComplete="no"
                />
              </div>

              <div>
                <label htmlFor="EmailId" className="createlabel">Email ID: </label>
                <input
                  className="createInput"
                  name="email"
                  type="text"
                  id="EmailId"
                  value={userData.email}
                  onChange={handleChange}
                  autoComplete="no"
                />
              </div>

              <div>
                <label htmlFor="Dob" className="createlabel">DOB: </label>
                <input
                  className="createInput"
                  name="DOB"
                  type="date"
                  id="Dob"
                  value={userData.DOB}
                  onChange={handleChange}
                  autoComplete="no"
                />
              </div>



              <div>
                <div>
                  <label htmlFor="qual" className="createlabel">Qualifications</label>
                </div>
                <div className="divbutton">

                  <button onClick={addField} id="qual" className="createQualBtn">Add</button>
                </div>
              </div>

              <div>
                {userData.qualifications.map((data, index) => (
                  <div key={index}>
                    <div className="divbutton">

                      <button
                        className="createQualBtn"
                        onClick={(e) => removeField(index, e)}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      className="createInput"
                      type="text"
                      name="qualification"
                      value={data.qualification}
                      onChange={(event) => handleChangeDynamic(index, event)}
                      autoComplete="no"
                      required
                    />

                  </div>
                ))}
              </div>
              <div className="imagefile">
                <label htmlFor="imageup" className="labelimg">

                  {imgFile ? (
                    <img src={URL.createObjectURL(imgFile)} alt="" className="createImgUpload" />
                  ) : imgURL ? (
                    <img src={imgURL} alt="" className="createImgUpload" />
                  ) : (
                    <img src="/user.png" alt="" className="createImgUpload" />
                  )}
                  <input
                    id="imageup"
                    name="img"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setimgFile(e.target.files[0])}
                  />
                  <div className="resumeUpload">

                    Update Your Image
                  </div>
                </label>
                {imgFile || imgURL ? (
                  <button onClick={handleImageRemove} className="resumeUpload">Remove Image</button>
                ) : null}
                <div className="resumeinput">
                  <div className="resumedit">
                    <label htmlFor="resume" className="resumeUpload">
                      {isResumeUpdated || resumeFile ? 'Updated' : 'Update Resume'}
                    </label>
                    <input
                      name="resume"
                      id="resume"
                      type="file"
                      accept=".pdf, .doc, .docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    <div className="resumeUpload">
                      {getUser.filter((user) => user.id === id) // Filter based on the current user's id
                        .map((user) => (
                          <a href={`${user.resume}`} className="prebtn" key={user.id}>
                            View Previous Resume
                          </a>
                        ))}
                    </div>

                  </div>
                </div>
              </div>
              <div className="save-delete">

                <button type="submit" className="buttoncreate saveButton" disabled={isUploading}>
                  {isUploading ? `Updating... ${progress.toFixed(2)}%` : 'Update'}
                </button>

                <Link className="buttoncreate HomeButtonnn" to="/">Home</Link>
                <Link className="buttoncreate HomeButtonnn" to="/view">View</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Edit;
