import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

const UploadPrescription = forwardRef(({ pdf, fileName, disabled = false }, ref) => {
    const pdfUploadRef = useRef(null);
    const pdfPreviewRef = useRef(null);


    useImperativeHandle(ref, () => ({
        validate: () => {
            const file = pdfUploadRef.current.files[0];

            return file && file.type === "application/pdf";
        },
        getValues: () => {
            const file = pdfUploadRef.current.files[0];
            return {
                PrescriptionBlob: file || null,
                Name: file ? file.name : null
            };
        },

        setFile: (file) => {
            if (file && file.type === "application/pdf") {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                pdfUploadRef.current.files = dataTransfer.files;

                // 👇 Create object URL for preview
                const fileURL = URL.createObjectURL(file);
                pdfPreviewRef.current.src = fileURL;
            }
        },

        clearValues: () => {
            // Clear the file input
            pdfUploadRef.current.value = "";

            // Clear the preview if you have one
            if (pdfPreviewRef.current) {
                pdfPreviewRef.current.src = "";
            }
        }
    }));



    useEffect(() => {
        const currentRef = pdfUploadRef.current;

        const handleChange = () => {

            const file = currentRef.files[0];

            if (file instanceof Blob && file.type === "application/pdf") {
                const objectUrl = URL.createObjectURL(file);
                pdfPreviewRef.current.src = objectUrl;

            } else {
                pdfPreviewRef.current.src = "";
            }

        };

        currentRef.addEventListener("change", handleChange);

        // ✅ This handles showing a preview from the prop (base64 blob)
        if (pdf && fileName) {
            pdfPreviewRef.current.src = `data:application/pdf;base64,${pdf}`;
            pdfPreviewRef.current.setAttribute('title', fileName);
            pdfPreviewRef.current.setAttribute('aria-label', fileName);
            pdfPreviewRef.current.setAttribute('name', fileName);
        }


        return () => {
            currentRef.removeEventListener("change", handleChange);
        };
    }, [pdf,fileName]);


    return (
        <div
            className="section upload-area"
            style={{
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? "none" : "auto"
            }}
        >
            <h3>Upload Prescription (PDF):</h3>
            <input
                type="file"
                accept="application/pdf"
                ref={pdfUploadRef}
                disabled={disabled}
            />{" "}
            <span className="ValidationAsteric">*</span>

            <iframe
                ref={pdfPreviewRef}
                name={fileName}
                title="PDF Preview"
                style={{
                    border: "1px solid #ccc",
                    width: "100%",
                    height: "300px",
                    pointerEvents: "auto"
                }}
            />
        </div>
    );

});

export default UploadPrescription;
