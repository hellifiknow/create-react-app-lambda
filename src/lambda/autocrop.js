
//Usage: http://127.0.0.1:9000/autocrop?imageX=0&imageY=0&imageWidth=450&imageHeight=600&cropX=0&cropY=0&cropWidth=107&cropHeight=248&cropStyle=1&rubberBandX=158.66666666666666&rubberBandY=102.66666666666666&rubberBandWidth=80&rubberBandHeight=78.66666666666666
exports.handler = function(event, context, callback) {

  console.log('queryStringParameters', event.queryStringParameters);
  let imageRectangle = new Rectangle(event.queryStringParameters.imageX,event.queryStringParameters.imageY,event.queryStringParameters.imageWidth,event.queryStringParameters.imageHeight);
  let cropRectangle = new Rectangle(event.queryStringParameters.cropX,event.queryStringParameters.cropY,event.queryStringParameters.cropWidth,event.queryStringParameters.cropHeight);
  let rubberBandRectangle = new Rectangle(event.queryStringParameters.rubberBandX,event.queryStringParameters.rubberBandY,event.queryStringParameters.rubberBandWidth,event.queryStringParameters.rubberBandHeight);
  let cropStyle = event.queryStringParameters.cropStyle;
  var croppedRectangle = CropImage(imageRectangle,cropRectangle,cropStyle,rubberBandRectangle);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ msg: 'Auto Cropped!', ...croppedRectangle })
  });

}


function Rectangle(X, Y, Width, Height) {
	this.X = X;
	this.Y = Y;
	this.Width = Width;
	this.Height = Height;
	this.Size = new RectangleSize(this.Width, this.Height);
	this.Top = Y;
	this.Left = X;
	this.Bottom = function() {
	return this.Height + this.Y;
	};
	this.Right = function() {
	return this.Width + this.X;
	};

};

function RectangleSize(Width, Height) {
	this.Width = Width;
	this.Height = Height
};

function Point(X, Y) {
	this.X = X;
	this.Y = Y
};

function CropImage(imageRectangle, cropShape, cropStyle, rubberBandRectangle) {
	var rubberBandCenterPoint = Center(rubberBandRectangle);
	//Find the largest crop rectangle with the ratio crop shape that will fit within the image rectangle
	var cropSize = CalculateLargestBoundedSize(cropShape.Size, imageRectangle.Size);
	var cropRectangle = new Rectangle(0, 0, cropSize.Width, cropSize.Height);
  console.log('CropStyle ', cropStyle);
	switch (cropStyle) {
	case '0':
		//Move the rectangle vertically to the centerpoint.
		cropRectangle.X = rubberBandCenterPoint.X - (cropRectangle.Width / 2);
		cropRectangle.Y = rubberBandCenterPoint.Y - (cropRectangle.Height / 2);
		//Resize vertically
		if (cropRectangle.Top < imageRectangle.Top) {
			let actual = rubberBandCenterPoint.Y - cropRectangle.Top;
			let available = rubberBandCenterPoint.Y - imageRectangle.Top;
			let zoomRatio = available / actual;
			let zoomedCroppedRectangle = ResizeRectangle(cropRectangle, zoomRatio, zoomRatio);
			cropRectangle = AlignCenters(zoomedCroppedRectangle, cropRectangle);
		} else {
			if (cropRectangle.Bottom() > imageRectangle.Bottom()) {
				let actual = rubberBandCenterPoint.Y - cropRectangle.Bottom();
				let available = rubberBandCenterPoint.Y - imageRectangle.Bottom();
				let zoomRatio = available / actual;
				let zoomedCroppedRectangle = ResizeRectangle(cropRectangle, zoomRatio, zoomRatio);
				cropRectangle = AlignCenters(zoomedCroppedRectangle, cropRectangle);
			}
		}
		//Resize horizontally
		if (cropRectangle.Left < imageRectangle.Left) {
			let actual = rubberBandCenterPoint.X - cropRectangle.Left;
			let available = rubberBandCenterPoint.X - imageRectangle.Left;
			let zoomRatio = available / actual;
			let zoomedCroppedRectangle = ResizeRectangle(cropRectangle, zoomRatio, zoomRatio);
			cropRectangle = AlignCenters(zoomedCroppedRectangle, cropRectangle);
		} else {
			if (cropRectangle.Right() > imageRectangle.Right()) {
				let actual = rubberBandCenterPoint.X - cropRectangle.Right();
				let available = rubberBandCenterPoint.X - imageRectangle.Right();
				let zoomRatio = available / actual;
				let zoomedCroppedRectangle = ResizeRectangle(cropRectangle, zoomRatio, zoomRatio);
				cropRectangle = AlignCenters(zoomedCroppedRectangle, cropRectangle);
			}
		}
		break;
	case '1':
		//The crop size will either have an equal width or height, that's the largest aspect
    console.log('CropStyle ', cropStyle);
		if (cropSize.Width === imageRectangle.Width) {
			//Move the rectangle vertically to the centerpoint.
			cropRectangle.Y = rubberBandCenterPoint.Y - (cropRectangle.Height / 2);
			if (cropRectangle.Top < imageRectangle.Top) {
				cropRectangle.Y = 0;
			} else if (cropRectangle.Bottom() > imageRectangle.Bottom()) {
				cropRectangle.Y = imageRectangle.Bottom() - cropRectangle.Height;
			}
		} else {
			cropRectangle.X = rubberBandCenterPoint.X - (cropRectangle.Width / 2);
			if (cropRectangle.Left < imageRectangle.Left) {
				cropRectangle.X = 0;
			} else if (cropRectangle.Right() > imageRectangle.Right()) {
				cropRectangle.X = imageRectangle.Right() - cropRectangle.Width;
			}
		}
		break;
	case '2':
		cropRectangle = new Rectangle(0, 0, imageRectangle.Width, imageRectangle.Height);
		break;
	default:
    console.log('CropStyle', cropStyle);
	}

	if(cropRectangle.X < 0)
	{
		cropRectangle.Width += cropRectangle.X;
		cropRectangle.X = 0;
	}

	if(cropRectangle.Y < 0)
	{
		cropRectangle.Height += cropRectangle.Y;
		cropRectangle.Y = 0;
	}
	return cropRectangle;
}

function Center(rect) {
	return new Point(rect.Left + rect.Width / 2, rect.Top + rect.Height / 2);
}

function CalculateLargestBoundedSize(sourceSize, boundingSize) {
	var widthScale = 0,
		heightScale = 0;
	if (sourceSize.Width !== 0) {
		widthScale = boundingSize.Width / sourceSize.Width;
	}
	if (sourceSize.Height !== 0) {
		heightScale = boundingSize.Height / sourceSize.Height;
	}
	var scale = Math.min(widthScale, heightScale);
	var resultSize = new RectangleSize(sourceSize.Width * scale, sourceSize.Height * scale);
	return (resultSize);
}

function ResizeRectangle(rF, widthRatio, heightRatio) {
	var newLeft = rF.Left * widthRatio;
	var newTop = rF.Top * heightRatio;
	var newWidth = rF.Width * widthRatio;
	var newHeight = rF.Height * heightRatio;
	var retR = new Rectangle(newLeft, newTop, newWidth, newHeight);
	return (retR);
}

function GetRectangleCenterPoint(rectangleF) {
	return new Point(rectangleF.Left + rectangleF.Width / 2, rectangleF.Top + rectangleF.Height / 2);
}

function AlignCenters(inner, outer) {
	var innerCenterPoint = GetRectangleCenterPoint(inner);
	var outerCenterPoint = GetRectangleCenterPoint(outer);
	var deltaX = outerCenterPoint.X - innerCenterPoint.X;
	var deltaY = outerCenterPoint.Y - innerCenterPoint.Y;
	return (new Rectangle(inner.X + deltaX, inner.Y + deltaY, inner.Width, inner.Height));
}
