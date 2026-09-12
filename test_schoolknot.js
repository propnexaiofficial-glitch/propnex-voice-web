const axios = require('axios');

async function testSchoolKnotAPI() {
    try {
        const payload = {
            "phone_number": "8851860838", // user's number
            "prompt_type": "outbound_new_lead",
            "parent_name": "Farhan Khalid",
            "student_name": "Test Student",
            "grade": "10th",
            "branch_name": "Main",
            "call_purpose": "Testing the new AI voice agent integration",
            "enquiry_id": 10234
        };

        console.log("Sending payload to SchoolKnot API:", payload);

        const response = await axios.post('https://vineeth-outbound.onrender.com/api/call/initiate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Success! Response:");
        console.log(response.data);
    } catch (error) {
        console.error("Error calling SchoolKnot API:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testSchoolKnotAPI();
