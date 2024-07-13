import { Link } from "react-router-dom";
import React from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Homepage() {
  const [reccount, setRecordCount] = React.useState(0);

  React.useEffect(() => {
    const fetchRecordCount = async () => {
      try {
        const recordsCollection = collection(db, "user");
        const querySnapshot = await getDocs(recordsCollection);

        setRecordCount(querySnapshot.size);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRecordCount();
  }, []);
  return (
    <div className="homeMain">
      <div className="homeMainBox">
        <div className="totalRecords">
          <h3 id="h3Home">Number of Records</h3>
          <input type="text" value={reccount} readOnly={true} id="totalnum" />
        </div>
        <div className="homeButtons">
          <Link className="homeButton" to="/create">
            Create Record
          </Link>
          <Link className="homeButton" to="/view">
            View Records
          </Link>
        </div>
      </div>
    </div>
  );
}
