import { CommentOutlined, FileImageOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, ColorPicker, Form, message, Modal, Radio, Row, Select, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
// import './ticket-raiser.css';
import '../components/ticket-raiser.css'
// import '../componts/CustomFloatingButton.css'
import helpDeskLog from './helpx.png';
import ArrowIcon from '../icons/arrowIcon';
import CircleIcon from '../icons/circleIcon';
import EraseIcon from '../icons/eraseIcon';
import PenIcon from '../icons/penIcon';
import RectangleIcon from '../icons/rectangleIcon';
import RedoIcon from '../icons/redoIcon';
import SaveIcon from '../icons/saveIcon';
import TextBoxIcon from '../icons/textBox';
import UndoIcon from '../icons/undoIcon';
import DraggableDiv from './dragableTextBox';




// Define the interface for the ticket
interface Ticket {
  username: string;
  description: string;
  priority: string;
  screenshot: string | null;
  application: number;
}

interface TicketRaiserProps {
  appClientId: number; //  app_client_id
  apiEndpoint: string; // API endpoint for ticket submission

}
interface DraggableDivProps {
  id: number;
}

export const TicketRaiser: React.FC<TicketRaiserProps> = ({ appClientId, apiEndpoint }) => {
  const [username] = useState('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState<string>('#ff0000'); //for color
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [shape, setShape] = useState<'rectangle' | 'circle' | 'arrow' | 'freehand'>('freehand'); //toset

  const [ticketDetails, setTicketDetails] = useState<Ticket>({
    username: 'admin',
    description: '',
    priority: 'Low',
    screenshot: null,
    application: appClientId,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [editedScreenshot, setEditedScreenshot] = useState<string | null>(null);
  const [divs, setDivs] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [width, setWidth] = useState<number>(150); // Initial width
  const [height, setHeight] = useState<number>(100); // Initial height
  const [visible, setVisible] = useState<boolean>(true);
  const [childColor, setChildColor] = useState<string>("#00ff00");
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleColorChange = (newColor: { toHexString: () => React.SetStateAction<string>; }) => {
    setColor(newColor.toHexString()); // Update the color state // Update the color state
  };
  const toggleColorPicker = () => {
    setIsColorPickerVisible((prev) => !prev);
  };


  // Toggle the ticket box
  const toggleTicketBox = async () => {
    if (!isOpen) {
      setIsOpen(true);

      const ticketRiser = document.querySelector('.ticket-riser') as HTMLElement;
      // const tooltipElement = document.querySelector('.ant-tooltip') as HTMLElement;

      if (ticketRiser) {
        ticketRiser.style.display = 'none';
        // tooltipElement.style.display = 'none';
      }

      // Capture a screenshot of the current screen
      const canvas = await html2canvas(document.body);
      const imgData = canvas.toDataURL('image/png');

      setTicketDetails((prevDetails) => ({
        ...prevDetails,
        screenshot: imgData,
      }));

      if (ticketRiser) {
        ticketRiser.style.display = 'block';
        // tooltipElement.style.display = '';
      }
    } else {
      clearCanvas();
      setHistory([]) //clearing
      setIsOpen(false);
      setTicketDetails((prevDetails) => ({
        ...prevDetails,
        screenshot: null, // Reset screenshot when closing the ticket box
      }));
    }
  };

  function dataURLToBlob(dataURL: string) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }

  // Handle form submission
  const handleSubmit = async (values: { description: string; priority: string, isImageNeeded: boolean }) => {
    if (values.description.trim()) {
      const updatedTicket = {
        ...ticketDetails,
        description: values.description,
        priority: values.priority,
        ticketId: 'null',
        serviceTicketId: 'll',
        contact: '',
        phoneNumber: '',
        category: 'null',
        assignedTo: 'null',
        supportEngineer: ' null',
        pcd: 'null',
        cc: '',
      };

      try {
        // Make an Axios POST request to submit the ticket
        const response = await axios.post(apiEndpoint + '/tickets/createFmsTicket', {
          ...updatedTicket,
          screenshot: null
        });

        //desPhotoUpload 
        //createFmsTicket 

        // Handle the success response
        if (response.status) {
          message.success(`Your ticket with Id #${response.data.data.ticketId} has been raised successfully`);
          console.log('Sended data', updatedTicket);
          console.log('Ticket Raised:', response.data);
          if (values.isImageNeeded) {
            // ticketDetails.screenshot;
            const formData = new FormData();
            // const blob = dataURLToBlob(ticketDetails.screenshot);
            // formData.append('file', blob, 'canvas-image.png');
            formData.append('ticketId', `${response.data.data.ticketId}`);
            await axios.post(apiEndpoint + '/tickets/desPhotoUpload', formData);
          }

          // Reset fields after successful submission
          setIsOpen(false);
          setTicketDetails({
            username: 'admin',
            description: '',
            priority: 'Low',
            screenshot: null,
            application: appClientId,
          });
        } else {
          message.error('Failed to raise the ticket. Please try again.');
        }
      } catch (error) {
        // Handle error response
        message.error('An error occurred while raising the ticket.');
        console.error('Error:', error);
      }
    } else {
      message.error('Please provide a description for your ticket.');
    }
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);


  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
    }
  };




  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setStartX(x);
        setStartY(y);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Save the current state for undo/redo
        const snapshot = canvas.toDataURL();
        setHistory((prevHistory) => [...prevHistory, snapshot]);
        setIsDrawing(true);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (shape === 'freehand') {
        // Draw freehand directly
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        // For shapes, clear and redraw for preview
        const img = new Image();
        img.src = history[history.length - 1];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // Draw the shape preview
          if (shape === 'rectangle') {
            ctx.strokeRect(startX, startY, x - startX, y - startY);
          } else if (shape === 'circle') {
            const radius = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
          } else if (shape === 'arrow') {
            const angle = Math.atan2(y - startY, x - startX);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();

            const arrowSize = 10;
            ctx.moveTo(x, y);
            ctx.lineTo(
              x - arrowSize * Math.cos(angle - Math.PI / 6),
              y - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(x, y);
            ctx.lineTo(
              x - arrowSize * Math.cos(angle + Math.PI / 6),
              y - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
        };
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || !canvasRef.current) return;

    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (shape === 'freehand') {
        // End freehand drawing
        ctx.closePath();
      } else {
        // Finalize the shape
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (shape === 'rectangle') {
          ctx.strokeRect(startX, startY, x - startX, y - startY);
        } else if (shape === 'circle') {
          const radius = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (shape === 'arrow') {
          const angle = Math.atan2(y - startY, x - startX);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(x, y);
          ctx.stroke();

          const arrowSize = 10;
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - arrowSize * Math.cos(angle - Math.PI / 6),
            y - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - arrowSize * Math.cos(angle + Math.PI / 6),
            y - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      }

      // Save the finalized state
      const snapshot = canvas.toDataURL();
      setHistory((prevHistory) => [...prevHistory, snapshot]);
    }
  };



  const undoLastAction = () => {
    if (history.length > 1) {
      const newRedo = history.pop(); // Remove last snapshot
      setRedoStack((prev) => [newRedo!, ...prev]);
      redraw(history[history.length - 1]); // Redraw the previous state
    }
  };

  const redoAction = () => {
    if (redoStack.length > 0) {
      const restored = redoStack.shift(); // Restore first redo state
      setHistory((prev) => [...prev, restored!]);
      redraw(restored!);
    }
  };

  const redraw = (snapshot: string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = snapshot;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
    }
  };

  const saveEditedImage = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image) {
      const mergedCanvas = document.createElement('canvas');
      const ctx = mergedCanvas.getContext('2d');
      mergedCanvas.width = image.width;
      mergedCanvas.height = image.height;
  
      if (ctx) {
        ctx.drawImage(image, 0, 0); // Draw the original image
        ctx.drawImage(canvas, 0, 0); // Overlay the canvas edits 
  
        // Draw text boxes onto the canvas
        divs.forEach((div) => {
          const element = document.getElementById(`draggable-${div.id}`);
          if (!element) {
            console.error(`Element with id draggable-${div.id} not found`);
            return; // Skip this iteration if the element is not found
          }
  
          const input = element.querySelector('input');
          if (!input) {
            console.error(`Input field not found in element draggable-${div.id}`);
            return; // Skip this iteration if the input is not found
          }
  
          const text = input.value; // Get the text content
          const rect = element.getBoundingClientRect(); // Get position and size
  
          // Adjust coordinates relative to canvas
          const x = rect.left - canvas.offsetLeft;
          const y = rect.top - canvas.offsetTop;
  
          ctx.font = '16px Arial';
          ctx.fillStyle = '#000'; // Text color
          ctx.fillText(text, x, y + 16); // Draw text on canvas
        });
  
        const finalImage = mergedCanvas.toDataURL('image/png');
        setEditedScreenshot(finalImage);
  
        // Displaying
        const imageElement = new Image();
        imageElement.src = finalImage;
        document.body.appendChild(imageElement);
      }
    }
    setIsModalVisible(false);
  };
  
  const handleAddDiv = () => {
    setDivs((prev) => {
      const lastDiv = prev[prev.length - 1]; // Get the last div
      const offset = 30; // The offset to apply for each new div
      const maxPosition = 300; // Maximum allowed position (adjust as needed)

      // Calculate new positions with wrapping logic
      const newX = lastDiv ? (lastDiv.x + offset) % maxPosition : 100;
      const newY = lastDiv ? (lastDiv.y + offset) % maxPosition : 100;

      return [
        ...prev,
        { id: prev.length + 1, text: 'New Text', x: newX, y: newY }
      ];
    });
  };






  return (
    <div className='ticket-riser'>
      {/* Floating button to open/close the ticket box */}
      {/* <Tooltip title="Raise Ticket"> */}
      <div className="floating-button-container">
        {/* Main Floating Button */}
        <div
          className="floating-button-main"

          style={{ backgroundImage: `url(${helpDeskLog})` }}
        ></div>
        {/* Hover Menu */}
        {/* {isHovered && ( */}
        <div className="floating-button-menu">
          <Button className="floating-button-action" onClick={toggleTicketBox}>
            <FileImageOutlined />
          </Button>
          <Button className="floating-button-action" onClick={() => message.loading("chatBot will implement soon!", 3)}>
            <CommentOutlinedned />
          </Button>
        </div>
        {/* )} */}
      </div>
      {/* </Tooltip> */}

      {isOpen && (
        <div className={`ticket-box ${isOpen ? 'open' : ''}`}>
          <div className="ticket-header">
            <span>Raising Ticket as {username}</span>
            <button onClick={toggleTicketBox} className="close-button">
              &#10005;
            </button>
          </div>
          <div className="ticket-content">
            {ticketDetails.screenshot && (
              <div className="screenshot-container">
                <img
                  src={ticketDetails.screenshot}
                  alt="Screenshot"
                  className="screenshot"
                  onClick={showModal}
                  style={{ cursor: 'pointer', maxWidth: '200px' }}
                />
              </div>
            )}
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please describe your issue' }]}
              >
                <TextArea
                  rows={4}
                  value={ticketDetails.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setTicketDetails({ ...ticketDetails, description: e.target.value })
                  }
                  placeholder="Describe your issue..."
                />
              </Form.Item>
              <Row justify='space-between'>
                <Col><Form.Item
                  label="Category"
                  name="category"
                  style={{ width: '100%' }}
                >
                  <Radio.Group>
                    <Radio.Button value="3">CR</Radio.Button>
                    <Radio.Button value="2">Bug</Radio.Button>
                  </Radio.Group>
                </Form.Item></Col>
                <Col>
                  <div style={{ display: 'flex', marginTop: '15px' }}>
                    <Form.Item name="isImageNeeded" valuePropName="checked" label='Include Attachment' noStyle>
                      <Checkbox />
                    </Form.Item>
                    &nbsp;&nbsp;&nbsp;<label htmlFor="">Include Attachment</label>
                  </div>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Submit Ticket
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
      <Modal
        title="Screenshot"
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        style={{ maxHeight: '500px', overflow: "auto", position: "relative", }}
        footer={[
          <div className="modal-footer">
            {/* Action Buttons */}
            <Tooltip title="Undo Last Action" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                key="undo"
                onClick={undoLastAction}
                disabled={history.length === 0}
                className="footer-button"
              >
                <UndoIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Redo Last Action" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                key="undo"
                onClick={redoAction}
                disabled={redoStack.length === 0}
                className="footer-button"
              >
                <RedoIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Clear Screen" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                key="clear"
                danger
                onClick={clearCanvas}
                className="footer-button"
              >
                <EraseIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Save Edited Image" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                key="save"
                onClick={saveEditedImage}
                className="footer-button"
              >
                <SaveIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Draw Rectangle" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                onClick={() => setShape('rectangle')}
                // title="Rectangle"
                className="footer-button"
              >
                <RectangleIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Draw Circle" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                onClick={() => setShape('circle')}
                // title="Circle"
                className="footer-button"
              >
                <CircleIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Draw Arrow" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                onClick={() => setShape('arrow')}
                // title="Arrow"
                className="footer-button"
              >
                <ArrowIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Freehand Drawing" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                onClick={() => setShape('freehand')}
                // title="Freehand"
                className="footer-button"
              >
                <PenIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Add TextBox" placement="top" overlayStyle={{ fontSize: '14px' }}>
              <Button
                onClick={handleAddDiv}
                className="footer-button"
              >
                <TextBoxIcon />
              </Button>
            </Tooltip> 

            {/* Color Picker Button */}
            <Tooltip title="Pick a Color" placement="top" overlayStyle={{ fontSize: '14px' }}>
              {/* <ColorPicker
                defaultValue={color}
                onChangeComplete={handleColorChange}
                showText
                style={{ width: '100%' }}
              /> */}
              {/* <Button className="footer-button"> */}
                <div
                  style={{
                    position: 'absolute',
                    // bottom: '0px',
                    background: '#f0f0f0',
                    right: '20%',
                    zIndex: 2000,
                    // background: '#fff',
                    padding: '3px',
                    // borderRadius: '8px',
                    // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* <ColorsIcon /> */}
                  {/* <Button   className="footer-button"> */}
                  <ColorPicker
                    showText
                    
                    defaultValue={color}
                    onChangeComplete={handleColorChange}
                    style={{ width: '100px',fontWeight:'bold'}}
                  // className="custom-color-picker"
                  />
                  {/* </Button> */}
                </div>
              {/* </Button> */}
            </Tooltip>
          </div>
        ]}
      >
        <div style={{ position: 'relative', width: '100%', height: '350px' }}>
          <img
            ref={imageRef}
            src={ticketDetails.screenshot || ''}
            alt="Screenshot"
            style={{ width: '100%', display: 'block' }}
          />
          {/* Canvas for Drawing */}
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              cursor: 'crosshair',
              // zIndex: -20,

            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* DraggableDivs on top of the image and canvas */}
          {divs.map((div) => (
            <DraggableDiv
              key={div.id}
              id={div.id}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TicketRaiser;