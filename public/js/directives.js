opentokMeet.directive('draggable', function ($document) {
    return function(scope, element, attrs){
        var mouseMoveHandler = function mouseMoveHandler(event) {
            y = event.pageY - startY;
            x = event.pageX - startX;
            element.css({
                top: y + 'px',
                left: x + 'px'
            });
        };
        
        var mouseUpHandler = function mouseUpHandler(event) {
            $document.unbind('mousemove', mouseMoveHandler);
            $document.unbind('mouseup', mouseUpHandler);
        };
        
        var position = element.css("position"),
            startX = 0, startY = 0,
            x = 0, y = 0;
        if (position !== "relative" && position !== "absolute") {
            element.css("positon", "relative");
            position = "relative";
        }
        
        element.on("mousedown", function (event) {
            event.preventDefault();

            switch (position) {
            case "relative":
                startX = event.pageX - x;
                startY = event.pageY - y;
                break;
            case "absolute":
                startX = event.pageX - parseInt(element.css("left"), 10);
                startY = event.pageY - parseInt(element.css("top"), 10);
                break;
            }
            $document.on("mousemove", mouseMoveHandler);
            $document.on("mouseup", mouseUpHandler);
            $($document[0].body).on("mouseleave", mouseUpHandler);
        });
    };
});