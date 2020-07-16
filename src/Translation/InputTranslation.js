import React, { useEffect, useState } from 'react';
import translationJSON from './translation.json';
import writeJsonFile from 'write-json-file';
let delayUpdate = null;

const NUMBER_OF_WORDS_FOR_FIELD = 5;

const InputTranslation = () => {
  const [jsonData, setJsonData] = useState(translationJSON);
  const [languages, setLanguages] = useState(Object.entries(translationJSON).map(([key, value]) => { return key; }));
  const [inputNewLanguage, setInputNewLanguage] = useState('');
  const [inputNewField, setInputNewField] = useState('');

  const [modelJson, setModelJson] = useState();

  useEffect(() => {
    setModelJson(_getModelJson(translationJSON))
  }, [])

  useEffect(() => {
    setLanguages(Object.keys(jsonData).map((key) => { return key; }))
  }, [jsonData])

  const _getModelJson = (jsonDataObject) => {
    let sampleJson = jsonDataObject[Object.keys(jsonDataObject)[0]].translations;
    Object.entries(jsonDataObject).map(([key, value]) => {
      if (Object.keys(value).length > Object.keys(sampleJson).length) {
        sampleJson = value
      }
    });

    return sampleJson;
  }


  const _handleAddNewLanguage = () => {
    if (jsonData[inputNewLanguage] != inputNewLanguage) {
      if (Object.keys(jsonData).length > 0) {
        let sampleJson = {
          ..._getModelJson(jsonData)
        };
        Object.entries(sampleJson).map(([key, value]) => { sampleJson[key] = '' });
        jsonData[inputNewLanguage] = {};
        jsonData[inputNewLanguage].translations = sampleJson
        const updateJSON = {
          ...jsonData
        }

        setJsonData(updateJSON);
        setInputNewLanguage('')
      }
    }
  }

  const _handleOnChangeInputNewLanguage = (e) => {
    let value = e.target.value
    if (delayUpdate) clearTimeout(delayUpdate);
    delayUpdate = setTimeout(() => {
      setInputNewLanguage((value).trim());
    }, 500)
  }

  const _handleOnChangeInputNewField = (e) => {
    let value = e.target.value
    if (delayUpdate) clearTimeout(delayUpdate);
    delayUpdate = setTimeout(() => {
      setInputNewField((value).trim());
    }, 500)
  }

  const _handleAddNewField = () => {
    const capitalizeWord = (s) => {
      if (typeof s !== 'string') return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
    }
    if (inputNewField) {
      if (String(inputNewField).length > 0) {

        let inputNewTxt = inputNewField.split(" ");
        inputNewTxt = inputNewTxt
          .map(item => capitalizeWord(item))
          .slice(0, NUMBER_OF_WORDS_FOR_FIELD)
          .join("");

        let updateJsonData = { ...jsonData }
        Object.keys(jsonData).map(key => { updateJsonData[key]["translations"][inputNewTxt] = "" })
        setJsonData(updateJsonData)
        setInputNewField('')
      }
    }
  }

  const _onChangeInputField = (event) => {
    let value = event.target.value;
    let contentData = event.target.name.split('_')
    let language = contentData[0];
    let field = contentData[1];
    if (delayUpdate) clearTimeout(delayUpdate);
    delayUpdate = setTimeout(() => {
      let updateJSON = { ...jsonData };
      updateJSON[language]["translations"][field] = value;

      setJsonData(updateJSON)
    }, 500)

  }

  const _handleDeleteField = (keyName) => {
    let updateJSON = { ...jsonData };
    languages.map(language => {
      delete updateJSON[language]["translations"][keyName];
    })
    setJsonData(updateJSON)
  }

  const _handleSaveJson = () => {
    let value = JSON.stringify(jsonData);
    localStorage.setItem('TRANSLATION', value)
  }

  const _handleExportJson = () => {
    _handleSaveJson();

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "text/plain"
    }));
    a.setAttribute("download", "resource.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <React.Fragment>
      <div style={{ width: '90%', padding: '5%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <button style={{ width: 120 }} onClick={_handleAddNewLanguage}>Add Language</button>
          <input style={{ flex: 1 }} defaultValue={inputNewLanguage} onChange={_handleOnChangeInputNewLanguage}  ></input>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <button style={{ width: 120 }} onClick={_handleAddNewField}>Add Field</button>
          <input style={{ flex: 1 }} defaultValue={inputNewField} onChange={_handleOnChangeInputNewField}  ></input>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <button style={{ width: 120 }} onClick={_handleSaveJson}>Save To localStorage</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <button style={{ width: 120 }} onClick={_handleExportJson}>Save File</button>
        </div>
        <table style={{ border: '1px solid', width: '100%' }}>
          <thead >
            <tr style={{ border: '1px solid' }}>
              <td>Remove</td>
              <td style={{ border: '1px solid', width: '250px' }}>KeyName </td>
              {
                languages.map(item => <td style={{ border: '1px solid' }} key={item}> {item}</td>)
              }
            </tr>
          </thead>
          <tbody >
            {
              modelJson &&
              Object.entries(modelJson).map(([key, value]) => {
                return (
                  <tr key={key} style={{ border: '1px solid' }}>
                    <td><button onClick={() => _handleDeleteField(`${key}`)}>Delete</button></td>
                    <td style={{ border: '1px solid' }}>{key}</td>
                    {languages.map(item => {
                      return <td key={`${item}_${key}`} style={{ border: '1px solid' }}>
                        <input style={{ border: 'none', outline: 'none', width: '100%' }} defaultValue={jsonData[item]["translations"][key]} name={`${item}_${key}`} onChange={_onChangeInputField} />
                      </td>
                    })}
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <div className="av">
          {/* <pre>
            {JSON.stringify(jsonData)}
          </pre> */}
        </div>
      </div>
    </React.Fragment >
  )
}

export default InputTranslation;