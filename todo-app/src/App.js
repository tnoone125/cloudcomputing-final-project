import React, { useState, useEffect } from "react";
import './App.css';

function App() {
  const [entries, setEntries] = useState([]);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Upon React Component Mounting, fetch the items from the server
  // This just occurs once.
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/items');
        const data = await response.json();
        setEntries(data.items);
        setShowLoader(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchItems();
  }, []);

  if (showLoader) {
    return (
      <>
        <div className="loader"></div>
      </>
    );
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Create FormData object from the form element
    const formData = new FormData(e.target);

    const what_to_do = formData.get('what_to_do');
    const due_date = formData.get('due_date');
  
    if (what_to_do && what_to_do.length > 0) {
      setEntries([...entries, {what_to_do: what_to_do, due_date: due_date, status: 'not_done'}]);
      const response = await fetch('/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          what_to_do: what_to_do,
          due_date: due_date,
        })
      });
      
      if (!response.ok) {
        console.error("Error when sending data");
      } else {
        console.log("Successfully added item.");
      }

      e.target.reset();
      setShowEntryForm(false);
    }
  }

  const getForm = () => {
    return (
      <div className="container">
          <form onSubmit={(e) => handleFormSubmit(e)} id="add-form">
              <div className="row">
                  <div className="col-sm-6">
                      what to do:
                      <input type="text" size="50" name="what_to_do" defaultValue="more homework?" />
                  </div>
                  <div className="col-sm-3">
                      when:
                      <input type="text" name="due_date" defaultValue="" />
                  </div>
                  <div className="col-sm-3">
                      <input type="submit" value="save the new item" />
                  </div>
              </div>
          </form>
      </div>
    );
  }

  const markRowAsDone = async (i) => {
    const task = entries[i];
    if (task.status === 'done') {
      return;
    }
    const newTask = {
      ...task,
      status: 'done',
    };
    let newEntries = entries.slice(0, i);
    newEntries.push(newTask);
    setEntries(newEntries.concat(entries.slice(i+1)));

    const response = await fetch(`/mark/${encodeURIComponent(task.what_to_do)}`, {
      method: 'PUT'
    });
    if (!response.ok) {
      console.error(`Error occurred when marking ${task.what_to_do}.`);
    } else {
      console.log(`${task.what_to_do} marked as done.`);
    }
  }

  const deleteRow = async (i) => {
    const task = entries[i].what_to_do;
    setEntries(entries.slice(0, i).concat(entries.slice(i+1)));

    const response = await fetch(`/delete/${encodeURIComponent(task)}`, {
      method: 'PUT'
    });

    if (!response.ok) {
      console.error(`Error occurred when deleting ${task.what_to_do}.`);
    } else {
      console.log(`${task.what_to_do} deleted.`);
    }
  }

  const getRowFromEntry = (entry, id) => {
    const addStrikethrough = entry.status === 'done';
    const className = addStrikethrough ? 'done' : 'not_done';
    return (
      <tr key={id}>
        <td className={className} style={{
            ...addStrikethrough ? { textDecoration: 'line-through' } : {}
          }}>{entry.what_to_do}</td>
        <td>{entry.due_date}</td>
        <td>
          <button onClick={() => markRowAsDone(id)}>mark as done</button>
          <button onClick={() => deleteRow(id)}>delete</button>
        </td>
      </tr>
    );
  }

  return (
    <>
      <div className="container">
        <h3>oh, so many things to do...</h3>
        <table className='table'>
          {entries.length > 0 ? entries.map((entry, index) => getRowFromEntry(entry, index))
            : <tr>
                  <td>
                      <em>Unbelievable. Nothing to do for now.</em>
                  </td>
              </tr>
        }
        </table>
        <button onClick={() => setShowEntryForm(!showEntryForm)} id='toggle-button'>{showEntryForm ? 'cancel the new entry' : 'add a new item'}</button>
        {
          showEntryForm ? getForm() : <></>
        }
      </div>
    </>
  );
}

export default App;
