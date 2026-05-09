import { useEffect, useRef, useState } from "react";

function StepsEditor() {
  const [steps, setSteps] = useState([{ id: 1, text: "" }]);
  const textareaRefs = useRef({});

  const focusLastStep = () => {
    const lastStep = steps[steps.length - 1];
    const textarea = textareaRefs.current[lastStep.id];

    if (textarea) {
      textarea.focus();
      const textLength = textarea.value.length;
      textarea.setSelectionRange(textLength, textLength);
    }
  };

  const handleEditorClick = (event) => {
    if (event.target.tagName.toLowerCase() === "textarea") return;

    focusLastStep();
  };

  const handleChange = (id, value) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, text: value } : step)),
    );
  };

  const handleKeyDown = (event, index, id) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const textarea = textareaRefs.current[id];
      const cursorPosition = textarea.selectionStart;
      const currentValue = steps[index].text;

      const beforeCursor = currentValue.slice(0, cursorPosition);
      const afterCursor = currentValue.slice(cursorPosition);

      const newStep = {
        id: Date.now(),
        text: afterCursor,
      };

      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], text: beforeCursor };
      updatedSteps.splice(index + 1, 0, newStep);

      setSteps(updatedSteps);

      setTimeout(() => {
        const nextTextarea = textareaRefs.current[newStep.id];

        if (nextTextarea) {
          nextTextarea.focus();
          nextTextarea.setSelectionRange(0, 0);
          autoResize(nextTextarea);
        }
      }, 0);
    }

    if (
      event.key === "Backspace" &&
      steps[index].text === "" &&
      steps.length > 1
    ) {
      event.preventDefault();

      const previousStepId = steps[index - 1]?.id;
      const updatedSteps = steps.filter((step) => step.id !== id);

      setSteps(updatedSteps);

      setTimeout(() => {
        const prevTextarea = textareaRefs.current[previousStepId];

        if (prevTextarea) {
          prevTextarea.focus();
          const len = prevTextarea.value.length;
          prevTextarea.setSelectionRange(len, len);
          autoResize(prevTextarea);
        }
      }, 0);
    }
  };

  const autoResize = (textarea) => {
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    steps.forEach((step) => {
      const textarea = textareaRefs.current[step.id];

      if (textarea) autoResize(textarea);
    });
  }, [steps]);

  return (
    <div className="steps-editor" onClick={handleEditorClick}>
      {steps.map((step, index) => (
        <div className="steps-editor__item" key={step.id}>
          <span className="steps-editor__bullet">•</span>

          <textarea
            ref={(el) => {
              textareaRefs.current[step.id] = el;
            }}
            className="steps-editor__textarea"
            name={`step-${index + 1}`}
            value={step.text}
            onChange={(event) => handleChange(step.id, event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, index, step.id)}
            rows={1}
            placeholder=""
          />
        </div>
      ))}
    </div>
  );
}

export default StepsEditor;
