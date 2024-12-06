
import React, { useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import "react-resizable/css/styles.css"; // Import default resizable styles
import "antd/dist/reset.css"; // Ensure Ant Design styles are included
import { Button, Input } from "antd";


const { TextArea } = Input;

interface DraggableDivProps {
  id: number;
}

interface DraggableDivProps {
  id: number;
  // x: number; // X position
  // y: number; // Y position

}

const DraggableDiv: React.FC<DraggableDivProps> = ({ id }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // Hide the div if not visible

  return (
    <Draggable handle=".handle" defaultPosition={{ x:0, y :0 }}>
      <div
        id={`draggable-${id}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          borderRadius: "8px",
          // left: x,
          // top: div.y,
          // padding: '10px',
          // border: '1px solid black',
          // background: '#f0f0f0',
        }}
      >
        <ResizableBox
          width={150}
          height={100}
          minConstraints={[100, 50]}
          maxConstraints={[300, 200]}
          style={{
            border: "1px solid #d9d9d9",
            background: "#f9f9f9",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Close Button */}
          <Button
            type="text"
            danger
            onClick={() => setVisible(false)}
            style={{
              position: "absolute",
              top: "-5px",
              right: "0px",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              padding: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            ✕
          </Button>

          {/* Draggable Handle */}
          <div
            className="handle"
            style={{
              cursor: "move",
              padding: "0px",
              background: "#d9d9d9",
              textAlign: "center",
              // fontWeight: "bold",
            }}
          >
            Drag me
          </div>

          {/* Input Field */}
          <input
            placeholder="Type here..."
            style={{
              width: "100%",
              height: "calc(100% - 20px)",
              padding: "8px",
              border: "none",
              outline: "none",
              fontSize: "14px",
              fontWeight: "bold",
              background: "transparent",
            }}
          />
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default DraggableDiv;
