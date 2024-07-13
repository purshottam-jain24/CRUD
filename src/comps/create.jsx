import React, { useEffect, useState } from "react";
import {db} from "../firebase/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Link, useNavigate } from "react-router-dom";

export default function CreateRec() {
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    DOB: "",
    qualifications: [],
  });
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState("");
  const [resume, setResume] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [resumeURL, setResumeURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const addField = (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      qualifications: [...prevData.qualifications, { qualification: "" }],
    }));
  };

  const removeField = (index, e) => {
    e.preventDefault();
    let updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  const handleChangeDynamic = (index, event) => {
    const { name, value } = event.target;
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications[index] = {
      ...updatedQualifications[index],
      [name]: value,
    };
    setFormData((prevData) => ({
      ...prevData,
      qualifications: updatedQualifications,
    }));
  };

  const uploadFile = async (file, folderName, genrateID) => {
    const storageRef = ref(storage, `${folderName}/${genrateID}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
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

  async function submitForm(e) {
    e.preventDefault();
    setIsUploading(true);
    const genrateID = nanoid();

    if (!resume) {
      alert("Resume is required");
      setIsUploading(false);
      return;
    }
    if (!file) {
      alert("Image is required");
      setIsUploading(false);
      return;
    }

    try {
      const imageUrl = file ? await uploadFile(file, "images", genrateID) : "";
      const resumeUrl = resume ? await uploadFile(resume, "resumes", genrateID) : "";

      setImageURL(imageUrl);
      setResumeURL(resumeUrl);

      const docRef = await setDoc(doc(db, "user", genrateID), {
        ...formData,
        img: imageUrl,
        resume: resumeUrl,
      });
      Navigate(`/view`);
      console.log("uploaded");
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsUploading(false);
    }

    resetForm();
    alert("Data Uploaded");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "DOB") {
      const currentDate = new Date();
      const selectedDate = new Date(value);

      if (selectedDate >= currentDate) {
        alert("DOB should be less than today's date");
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleContactChange = (e) => {
    const inputText = e.target.value.replace(/\D/g, '');
    setFormData((prevData) => ({
      ...prevData,
      contact: inputText.slice(0, 10),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      contact: "",
      email: "",
      DOB: "",
      qualifications: [],
    });
    setFile(null);
    setResume(null);
    setImageURL(null);
    setResumeURL(null);
  };

  return (
    <div className="createHome">
      <form onSubmit={submitForm}>
        <div className="create-outbox">
          <div className="inputFields">
            <div className="inputdiv">
              <label htmlFor="Name" className="createlabel">Name : </label>
              <input
                className="createInput"
                name="name"
                type="text"
                id="Name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="yes"
                required
              />
            </div>

            <div className="inputdiv">
              <label htmlFor="Address" className="createlabel">Address : </label>
              <input
                className="createInput"
                name="address"
                type="text"
                id="Address"
                value={formData.address}
                onChange={handleChange}
                autoComplete="yes"
                required
              />
            </div>

            <div className="inputdiv">
              <label htmlFor="Contact" className="createlabel">
                Contact :{" "}
              </label>
              <input
                className="createInput"
                name="contact"
                type="text"
                id="Contact"
                value={formData.contact}
                onChange={handleContactChange}
                autoComplete="yes"
                pattern="[0-9]*"
                maxLength="10"
                required
              />
            </div>



            <div className="inputdiv">
              <label htmlFor="EmailId" className="createlabel">Email ID: </label>
              <input
                className="createInput"
                name="email"
                type="email"
                id="EmailId"
                value={formData.email}
                onChange={handleChange}
                autoComplete="yes"
                required
              />
            </div>

            <div className="inputdiv">
              <label htmlFor="date" className="createlabel">DOB: </label>
              <input
                className="createInput"
                name="DOB"
                type="date"
                id="date"
                value={formData.DOB}
                onChange={handleChange}
                autoComplete="yes"
                required
              />
            </div>

            <div>
              <div>
                <div>
                  <label htmlFor="qual" className="createlabel">Qualifications: </label>
                </div>
                <div className="divbutton">

                  <button onClick={addField} id="qual" className="createQualBtn">Add</button>
                </div>

                {formData.qualifications.map((form, index) => (
                  <div key={index}>
                    <div className="divbutton">

                      <button className="createQualBtn" onClick={(e) => removeField(index, e)}>
                        Remove
                      </button>
                    </div>
                    <input
                      className="createInput"
                      type="text"
                      name="qualification"
                      value={form.qualification}
                      onChange={(event) => handleChangeDynamic(index, event)}
                      required
                    />

                  </div>
                ))}
              </div>
            </div>

          </div>
          <div className="imagefile">
            <label htmlFor="imageup" className="labelimg">

              <img
                className="createImgUpload"
                src={file ? URL.createObjectURL(file) : "/user.png"}
                alt="no image"
              />
              <input
                id="imageup"
                type="file"
                accept="image/*"
                name="image"
                onChange={(e) => setFile(e.target.files[0])}

              />
              <div className="resumeUpload">

                Upload Your Image
              </div>
            </label>
            <div className="resumeinput">
              <label htmlFor="resume" className="resumeUpload">{resume ? `Uploaded` : 'Upload Your Resume'}</label>
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf, .doc, .docx"
                onChange={(e) => setResume(e.target.files[0])}

              />
            </div>
          </div>
          <br />
          <div className="save-delete">
            <button className="buttoncreate saveButton" type="submit" disabled={isUploading}>
              {isUploading ? `Uploading... ${progress.toFixed(2)}%` : "Save"}
            </button>

            <button className="buttoncreate resetButton" type="button" onClick={resetForm}>
              Reset
            </button>

            <Link className="buttoncreate HomeButtonnn" to="/">Home</Link>

          </div>
        </div>
      </form>
    </div>
  );
}
