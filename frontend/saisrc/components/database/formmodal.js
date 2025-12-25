import React, { useState, useEffect } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { addcoursemasterApi, getSkillApi, gettopicApi } from '../../api/endpoints'

//import Select from 'react-select';


const FormModal = () => {
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);    
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [is_active, setisactive] = useState(false);


    useEffect(() => {
        gettopicApi()
            .then(data => {
                setTopics(data.map(item => ({ value: item.id, label: item.topic })));
            })
            .catch(error => console.error('Error fetching data:', error));
        
        getSkillApi()
        .then(data => {
            setSkills(data.map(item => ({ value: item.id, label: item.skill_name })))
        })
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();

        const topicId = selectedTopics ? selectedTopics.value : null;
        const skillId = selectedSkills ? selectedSkills.value : null;

        const formData = new FormData(e.target);

        const coursemaster = {
            course_name: formData.get('course_name'),
            skill_id: skillId,
            topic_id: topicId,
            total_enrollment: formData.get('total_enrollment'),
            course_count: formData.get('course_count'),
            dtm_start: formData.get('dtm_start'),
            dtm_end: formData.get('dtm_end'),
            is_active: is_active




        };

        console.log("Result: ", coursemaster)

        addcoursemasterApi(coursemaster)
            .then((result) => {
                window.alert("Course added successfully");

            })
            .catch((error) => {
                console.error("Failed to Add Data", error);  // Log the error to the console
                alert("Failed to Add. Check console for details.");
            });
    };

    return (
        <div>
            <div className='test'>
              
                <Row>
                    <Col >
                        <Form onSubmit={handleSubmit}>

                            <Row>
                                <Col sm={4}>
                                    <Form.Group controlId='course_name'>
                                        <Form.Label>course_name</Form.Label>
                                        <Form.Control type="text" name="course_name" required placeholder="" />
                                    </Form.Group>
                                </Col>


                                <Col sm={4}>
                                    <Form.Group controlId='total_enrollment'>
                                        <Form.Label>total_enrollment</Form.Label>
                                        <Form.Control type="text" name="total_enrollment" required placeholder="" />
                                    </Form.Group>
                                </Col>


                            
                                <Col sm={4}>
                                    <Form.Group controlId='topic'>
                                        <Form.Label>Topic</Form.Label>
                                        <Select
                                            options={topics}
                                            value={selectedTopics}
                                            onChange={setSelectedTopics}
                                            placeholder="Select Topic"
                                        />
                                        </Form.Group>
                                </Col>
                            </Row> <p></p>
                            <Row>    
                            
                                <Col sm={4}>
                                    <Form.Group controlId='skill'>
                                        <Form.Label>Skill Name</Form.Label>
                                        <Select
                                            options={skills}
                                            value={selectedSkills}
                                            onChange={setSelectedSkills}
                                            placeholder="Select Skills"
                                        />
                                        </Form.Group>
                                </Col>
                            

                                <Col sm={4}>
                                    <Form.Group controlId='course_count'>
                                        <Form.Label>course_count</Form.Label>
                                        <Form.Control type="number" name="course_count" required placeholder="" />
                                    </Form.Group>
                                </Col>
                            


                                <Col sm={4}>
                                    <Form.Group controlId='dtm_start'>
                                        <Form.Label>Data of Active</Form.Label>
                                        <Form.Control type="datetime-local" name="dtm_start" required placeholder="" />
                                    </Form.Group>
                                </Col>
                                </Row> <p></p>
                                <Row>

                                <Col sm={4}>
                                    <Form.Group controlId='dtm_end'>
                                        <Form.Label>Date of Validity</Form.Label>
                                        <Form.Control type="datetime-local" name="dtm_end" required placeholder="" />
                                    </Form.Group>
                                </Col>



                            
                                <Col sm={4}>
                                    <Form.Group controlId='is_active'>
                                        <Form.Label>is_active</Form.Label>
                                        <Form.Check
                                            type="switch"
                                            className="custom-switch"
                                            id="custom-switch"
                                            label=""
                                            checked={is_active}
                                            onChange={(e) => setisactive(e.target.checked)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row> <br></br>

                            <Form.Group>
                                <Button type="submit" style={{ width: '70px' }}>
                                    Save
                                </Button>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row> <p></p>


            </div>


        </div>
    );

};

export default FormModal;