//Visualization for Section 1; TIMELINE CHART

let timeline = function(){

    //--------PROPERTIES--------
    this._selection = null;
    this._size = null;
    this._margin = null;
    this._data = null;
    this._ypos = null;
    this._colorScale = null;
    this._xScale = null;
    this._barHeight = null;
    this._dispatch = null;
    this._delay = 0;
    this._hover = false;
    this._tooltip = null;

    let canvas = null;

    //--------SETTERS--------
    this.selection = function(){
        if(arguments.length > 0){
            this._selection = arguments[0];
            return this;
        } else return this._selection;
    }

    this.size = function(){
        if(arguments.length > 0){
            this._size = {w:0, h:0}
            this._size.w = arguments[0].w - this._margin.l - this._margin.r;
            this._size.h = arguments[0].h - this._margin.h - this._margin.b;
            return this;
        } else return this._size;
    }

    this.margin = function(){
        if(arguments.length > 0){
            this._margin = arguments[0];
            return this;
        } else return this._margin;
    }

    this.data = function(){
        if(arguments.length > 0){
            this._data = arguments[0];
            return this;
        } else return this._data;
    }

    this.colorScale = function(){
        if(arguments.length > 0){
            this._colorScale = arguments[0];
            return this;
        } else return this._colorScale;
    }

    this.ypos = function(){
        if(arguments.length > 0){
            this._ypos = arguments[0];
            return this;
        } else return this._ypos;
    }

    this.barHeight = function(){
        if(arguments.length > 0){
            this._barHeight = arguments[0];
            return this;
        } else return this._barHeight;
    }

    this.delay = function(){
        if(arguments.length > 0){
            this._delay = arguments[0];
            return this;
        } else return this._delay;
    }

    this.dispatch = function(){
        if(arguments.length > 0){
            this._dispatch = arguments[0];

            this._dispatch.on('expandBars', () => {
                this.draw();
            })

            return this;
        } else return this._dispatch;
    }

    this.hover = function(){
        if(arguments.length > 0){
            this._hover = arguments[0];
            return this;
        } else return this._hover;
    }

    this.tooltip = function(){
        if(arguments.length > 0){
            this._tooltip = arguments[0];
            return this;
        } else return this._tooltip;
    }

    //--------FUNCTIONS--------

    //creating visualization
    this.draw = function(){
        this._xScale = d3.scaleLinear()
            .domain([d3.min(this._data.map(d => +d.start)), d3.max(this._data.map(d => +d.end))])
            .range([0, this._size.w]);

        canvas = this._selection.selectAll('g')
            .data([0])
            .join('g')
            .attr('transform',`translate(${this._margin.l}, ${this._margin.t})`);

        let rects = canvas.selectAll('.timelineRects')
            .data(this._data)
            .join('rect')
            .classed('timelineRects', true)
            .classed('tang', ()=>{
                if(this._hover) return true;
                else return false;
            })
            .attr('x', d => this._xScale(+d.start))
            .attr('y', this._ypos)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('width', d => this._xScale(+d.end)- this._xScale(+d.start))
            .attr('height', 0)
            .attr('fill', (d,i) => {
                if(i%2 == 0) return colorPalatte[7];
                else return 'rgba(255, 255, 255, 0.482)';
            })
            .transition()
            .duration(this._delay)
            .delay(this._delay * 2)
            .ease(d3.easeLinear)
            .attr('height', this._barHeight)

        this.yearTag();
        this.periodLabel();

        //tooltip
        let tooltip = this._tooltip;

        if(this._hover === true){

            d3.selectAll('.tang').on('mouseover', function(e){
                let info = d3.select(this).data()[0];

                let name = `<p><b>Name:</b> ${info.emperorEn} - ${info.emperorCh}</p>`;
                let reign = `<p><b>Reign:</b> ${info.start} - ${info.end}</p>`;
                let templeName = `<p><b>Temple Name:</b> ${info.templeEn} - ${info.templeCh}</p>`;

                tooltip.style('visibility', 'visible')
                    .style('left', (e.pageX + 20) + 'px')
                    .style('top', (e.pageY + 20) + 'px')
                    .html(name+templeName+reign);
            }).on('mouseout', function(){
                tooltip.style('visibility', 'hidden')
            })
        }
    };

    //placing year tag
    this.yearTag = function(){
        let years = this._data.map(d => d.start);
        years.push(this._data[this._data.length-1].end)
        let yearstag = canvas.append('g');
        yearstag.selectAll('.yearTag')
            .data(years)
            .join('text')
            .classed('yearTag',true)
            .attr('x', d => this._xScale(d))
            .attr('y', this._ypos + this._barHeight + 14)
            .text(d => {
                if (d < 0) return `${-d} B.C.`;
                else if (d == 710 || d == 824) return '';
                else return d;
            })
            .attr('opacity', 0.0)
            .transition()
            .duration(this._delay)
            .delay(this._delay * 2)
            .attr('opacity', 1.0)
    }

    //placing label
    this.periodLabel = function(){
        let yoffset = 5;
        let labelList = [];

        if (this._data[0].period) labelList = this._data.map(d => d.period);
        else {
            labelList = this._data.map(d => d.emperorEn.split(' ')[1] + ' ' + d.emperorCh);
        }

        let labels = canvas.append('g')
        labels.selectAll('.periodLabel')
            .data(this._data)
            .join('g')
            .call(g => g.append('text')
                .classed('periodLabel', true)
                .attr('x', d => this._xScale(d.start) + (this._xScale(d.end) - this._xScale(d.start))/2)
                .attr('y', this._ypos - yoffset)
                .text((d, i) => {
                    let dist = this._xScale(d.end) - this._xScale(d.start);
                    if(dist > 10) return labelList[i].split(' ')[0];
                    else return;
                }))
            .call(g => g.append('text')
                .classed('periodLabel', true)
                .attr('x', d => this._xScale(d.start) + (this._xScale(d.end) - this._xScale(d.start))/2)
                .attr('y', this._ypos - yoffset - 15)
                .text((d, i) => {
                    let dist = this._xScale(d.end) - this._xScale(d.start);
                    if(dist > 10) return labelList[i].split(' ')[1];
                    else return;
                }))
            .attr('opacity', 0.0)
            .transition()
            .duration(this._delay)
            .delay(this._delay * 2)
            .attr('opacity', 1.0);
    }
}




/*-------------------------------------------------------*/


//CALLOUT MARK (OBJECT) FOR TIMELINE CHART

let calloutMark = function(){

    //--------PROPERTIES--------
    this._sourceData = null;
    this._targetData = null;
    this._selection = null;
    this._margin = null;
    this._size = null;
    this._ypos = null;
    this._barHeight = null;
    this._dispatch = null;

    //--------SETTERS--------
    this.sourceData = function(){
        if(arguments.length > 0){
            this._sourceData = arguments[0];
            return this;
        } else return this._sourceData;
    }

    this.targetData = function(){
        if(arguments.length > 0){
            this._targetData = arguments[0];
            return this;
        } else return this._targetData;
    }

    this.selection = function(){
        if(arguments.length > 0){
            this._selection = arguments[0];
            return this;
        } else return this._selection;
    }

    this.size = function(){
        if(arguments.length > 0){
            this._size = {w:0, h:0}
            this._size.w = arguments[0].w - this._margin.l - this._margin.r;
            this._size.h = arguments[0].h - this._margin.h - this._margin.b;
            return this;
        } else return this._size;
    }

    this.margin = function(){
        if(arguments.length > 0){
            this._margin = arguments[0];
            return this;
        } else return this._margin;
    }

    this.ypos = function(){
        if(arguments.length > 0){
            this._ypos = arguments[0];
            return this;
        } else return this._ypos;
    }

    this.barHeight = function(){
        if(arguments.length > 0){
            this._barHeight = arguments[0];
            return this;
        } else return this._barHeight;
    }

    this.dispatch = function(){
        if(arguments.length > 0){
            this._dispatch = arguments[0];

            this._dispatch.on('expandMarks', () =>{
                this.draw();
            })

            return this;
        } else return this._dispatch;
    }

    //--------FUNCTIONS-------

    //creating visualization
    this.draw = function(){
        let sourceScale = d3.scaleLinear()
            .domain([d3.min(this._sourceData.map(d => +d.start)), d3.max(this._sourceData.map(d => +d.end))])
            .range([0, this._size.w]);
        
        let targetScale = d3.scaleLinear()
            .domain([d3.min(this._targetData.map(d => +d.start)), d3.max(this._targetData.map(d => +d.end))])
            .range([0, this._size.w]);
        
        let canvas = this._selection.selectAll('.g-callout')
            .data([0])
            .join('g')
            .classed('g-callout', true)
            .attr('transform',`translate(${this._margin.l}, ${this._margin.t})`);
        
        //placing marks
        let marks = canvas.selectAll('.calloutMark')
            .data(targetScale.domain());
        
        marks.join('line')
            .classed('calloutMark', true)
            .attr('x1', d => sourceScale(d))
            .attr('x2', d => sourceScale(d))
            .attr('y1', this._ypos[0] - 3)
            .attr('y2', this._ypos[0] + this._barHeight + 5)
            .attr('opacity', 0.0)
            .transition()
            .duration(500)
            .attr('opacity', 1.0);

        //placing callout line
        let calloutLine = canvas.selectAll('.calloutLine')
            .data(targetScale.domain());
        
        calloutLine.join('line')
            .classed('calloutLine', true)
            .attr('x1', d => sourceScale(d))
            .attr('x2', d => targetScale(d))
            .attr('y1', this._ypos[0] + this._barHeight + 8)
            .attr('y2', this._ypos[1] - 30)
            .attr('stroke-dasharray', '0, 1')
            .transition()
            .duration(500)
            .delay(500)
            .attrTween('stroke-dasharray', function(d){
                let length = this.getTotalLength();
                return d3.interpolate(`0, ${length}`, `${length}, ${length}`)
            })
            .transition()
            .duration(0)
            .attr('stroke-dasharray', '12 5');
    }
}