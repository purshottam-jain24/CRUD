import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getStorage, deleteObject, ref } from "firebase/storage";
import { Link } from "react-router-dom";
import {db} from "../firebase/firebase";

export default function ViewRecords() {
  const [getUser, setGetUser] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGetUser(userList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const trimUrl = (url) => {
    const startIndex = url.indexOf("o/") + "o/".length;
    const endIndex = url.indexOf("?");
    return decodeURIComponent(url.substring(startIndex, endIndex).replace(/\%20/g, " "));
  };

  const deleteRecord = async (user) => {
    const storage = getStorage();
    const imgTrimUrl = trimUrl(user.img);
    const resTrimUrl = trimUrl(user.resume);

    try {
      await Promise.all([
        deleteDoc(doc(db, "user", user.id)),
        deleteObject(ref(storage, imgTrimUrl)),
        deleteObject(ref(storage, resTrimUrl)),
      ]);

      setGetUser((prevUser) => prevUser.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  return (
    <>
      <div className="viewContainer">
        <div className="maincontainerview">
          <div className="maincontainerviewh1">
            <h1>Records</h1>
          </div>
          <div className="mainconatainerviewbtn">
            <Link to={"/"} className="btn">Home</Link>
            <Link to={"/create"} className="btn">Create</Link>
          </div>
        </div>
        <div className="tableContainer">
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Qualification</th>
                <th>Profile</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getUser.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.contact}</td>
                  <td>{user.address}</td>
                  <td>
                    <ul>
                      {user.qualifications.map((qualification, index) => (
                        <li key={index}>{qualification.qualification},</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <Link to={user.img}>
                      {user.img ? (
                        <img className="tableImage" src={user.img} alt="" />
                      ) : (
                        <img className="tableImage" src="/user.png" alt="Default" />
                      )}
                    </Link>
                  </td>
                  <td>
                    <a href={`${user.resume}`} className="previewbtn">Preview</a>
                  </td>
                  <td className="tableButton">
                    <div className="buttoncontainer">
                      <Link
                        className="linkdec editbtn"
                        to={`/view/${user.id}/Edit`}
                      >
                        Edit
                      </Link>
                      <button onClick={() => deleteRecord(user)} className="delbtn">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
