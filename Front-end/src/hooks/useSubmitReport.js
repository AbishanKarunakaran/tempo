import { useState } from 'react';
import { createReport, sendReportOtp, verifyReportOtp } from '../api';

const categoryToViolationType = {
    "illegal-dumping": "Illegal waste disposal",
    "water-pollution": "Water pollution",
    "air-pollution": "Air pollution",
    "deforestation": "Deforestation",
    "noise": "Noise pollution",
    "wildlife": "Wildlife Poaching",
    "chemical": "Chemical Waste",
    "landfill": "Illegal Landfill",
    "other": "Other"
};


export const useSubmitReport = () => {
    const [formData, setFormData] = useState({
        category: "",
        description: "",
        latitude: "",
        longitude: "",
        locationName: "",
        district: "",
        user_email: ""
    });
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [violationId, setViolationId] = useState("");

    // OTP related state
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [sendOtpLoading, setSendOtpLoading] = useState(false);
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (e.target.name === 'user_email') {
            setEmailVerified(false);
            setOtpSent(false);
            setOtp("");
        }
    };

    const handleSendOtp = async () => {
        if (!formData.user_email) return alert("Please enter a valid email address first!");
        setSendOtpLoading(true);
        try {
            await sendReportOtp({ email: formData.user_email });
            setOtpSent(true);
            alert("OTP verification email has been sent!");
        } catch (err) {
            console.error("Failed to send OTP:", err);
            alert(err.response?.data?.error || "Failed to send OTP. Please check your email address.");
        } finally {
            setSendOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return alert("Please enter the OTP sent to your email!");
        setVerifyOtpLoading(true);
        try {
            await verifyReportOtp({ email: formData.user_email, otp });
            setEmailVerified(true);
            alert("Email verified successfully!");
        } catch (err) {
            console.error("Failed to verify OTP:", err);
            alert(err.response?.data?.error || "Invalid or expired OTP.");
        } finally {
            setVerifyOtpLoading(false);
        }
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        const fileReaders = files.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        data: reader.result,
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(fileReaders).then((processedFiles) => {
            const newMedia = [...mediaFiles, ...processedFiles].slice(0, 5);
            setMediaFiles(newMedia);
        });
    };

    const removeMedia = (index) => {
        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category) return alert("Please select a violation type!");
        if (!formData.latitude || !formData.longitude) return alert("Please pin the violation location on the map!");
        if (formData.user_email && !emailVerified) {
            return alert("Please verify your email address via OTP before submitting.");
        }

        setLoading(true);
        try {
            const violationType = categoryToViolationType[formData.category] || "Other";
            const firstFile = mediaFiles.length > 0 ? mediaFiles[0] : null;

            const payload = {
                user_id: null,
                user_email: formData.user_email || null,
                violation_type: violationType,
                description: formData.description,
                location_name: formData.locationName,
                longitude: formData.longitude || null,
                latitude: formData.latitude || null,
                district: formData.district || null,
                file_type: firstFile ? firstFile.type : "",
                file_url: firstFile ? firstFile.data : ""
            };

            const response = await createReport(payload);
            setViolationId(response.data.violation_id);
            setSuccess(true);
        } catch (err) {
            console.error("Submission error:", err);
            alert(err.response?.data?.error || "Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return { 
        formData, setFormData, mediaFiles, loading, success, violationId,
        otp, setOtp, otpSent, emailVerified, sendOtpLoading, verifyOtpLoading,
        handleSendOtp, handleVerifyOtp,
        handleChange, handleMediaChange, removeMedia, handleSubmit 
    };
};
