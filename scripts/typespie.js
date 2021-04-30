//Visualization for Section 2; TYPES CHART

let typesPie = function(){

    //--------PROPERTIES--------
    this._data = null;
    this._selection = null;
    this._innerRadius = 45;
    this._outerRadius = 220;
    this._size = null;
    this._colorScale = null;
    this._intro = null;

    let canvas = null;
    let tooltip = null;
    let intro;

    //--------SETTERS--------
    this.data = function(){
        if(arguments.length > 0){
            this._data = arguments[0];
            return this;
        } else return this_data;
    }

    this.intro = function(){
        if(arguments.length > 0){
            this._intro = arguments[0];
            intro = this._intro
            return this;
        } else return this_intro;
    }

    this.selection = function(){
        if(arguments.length > 0){
            this._selection = arguments[0];
            return this;
        } else return this._selection;
    }

    this.innerRadius = function(){
        if(arguments.length > 0){
            this._innerRadius = arguments[0];
            return this;
        } else return this._innerRadius;
    }

    this.outerRadius = function(){
        if(arguments.length > 0){
            this._outerRadius = arguments[0];
            return this;
        } else return this._outerRadius;
    }

    this.size = function(){
        if(arguments.length > 0){
            this._size = arguments[0];
            return this;
        } else return this._size;
    }

    //--------FUNCTIONS--------

    //creating visualization
    this.draw = function(){
        //processing data
        this.groupData();

        let xScale = d3.scaleBand()
            .domain(this._data.map(d => d[0]))
            .range([0, Math.PI * 2]);

        let yScale = d3.scaleRadial()
            .domain([0, d3.max(this._data.map(d => d[2].length))])
            .range([this._innerRadius, this._outerRadius]);
        
        let textPos = d3.scaleBand()
            .domain(this._data.map(d => d[0]))
            .range([-10, 220]);
        
        let colorScale = d3.scaleOrdinal()
            .domain(this._data.map(d => d[0]))
            .range(colorPalatte)

        let arc = d3.arc()
            .innerRadius(d => yScale(0))
            .outerRadius(d => yScale(d[2].length))
            .startAngle(d => xScale(d[0]))
            .endAngle(d => xScale(d[0]) + xScale.bandwidth())
            .padAngle(0.09)
            .padRadius(this._innerRadius);
        
        let canvas = this._selection.append('g')
            .attr('transform', `translate(${this._size.w/3.5}, ${this._size.h/2})`);

        let bars = canvas.append('g')
            .selectAll('g')
            .data(this._data)
            .join('g')
            .call(g => g.append('path')
                .classed('typesBar', true)
                .attr('d', arc))
                .attr('fill', d => colorScale(d[0]))
            .call(g => g.append('text')
                .classed('typesBarText', true)
                .attr('x', d => (yScale(d[2].length) + 12) * Math.cos(xScale(d[0]) + xScale.bandwidth() / 2 - Math.PI / 2))
                .attr('y', d => (yScale(d[2].length) + 12) * Math.sin(xScale(d[0]) + xScale.bandwidth() / 2 - Math.PI / 2))
                .text(d => d[2].length))
                .style('dominant-baseline', 'middle');
        
        let texts = canvas.append('g');
        
        texts.selectAll('.typesLabel')
            .data(this._data)
            .join('text')
            .classed('typesLabel', true)
            .attr('x', d => {
                if (this._size.w > 800) return 275;
                return 250;
            })
            .attr('y', d => textPos(d[0]))
            .text(d => d[0] + ' - ' + d[1]);
    
        this.pieHover();
        this.textHover();
        this.sticker();
    }

    //processing data
    this.groupData = function(){
        let group = d3.group(this._data, d=>d.categoryEn)
        group = Array.from(group);
        group.forEach(d => d.splice(1, 0, d[1][0].categoryCh))
        this._data = group;
    }

    //interactive(pie hover) function
    this.pieHover = function(){
        d3.selectAll('.typesBar').on('mouseover', function(e){

            d3.selectAll('.typesBar').attr('stroke-width', 1);
            d3.select(this).attr('stroke-width', 2);

            let value = d3.select(this).data()[0][0];

            d3.selectAll('.typesLabel')
                .style('font-weight', d => {
                    if(d[0] == value) return 800;
                })
                .style('font-size', d => {
                    if(d[0] == value) return '15px';
                })
            
            d3.selectAll('.typesBarText')
                .style('font-weight', d => {
                    if(d[0] == value) return 800;
                })
                .style('font-size', d => {
                    if(d[0] == value) return '15px';
                })
            
            let texts = intro.filter(d => d.categoryEn == value)[0].intro;

            d3.select('.typesSticker')
                .html(`<h3>${value}:</h3><p>${texts}</p>`)
        });
    }

    //interactive(text hover) function
    this.textHover = function(){
        d3.selectAll('.typesLabel').on('mouseover', function(e){

            d3.selectAll('.typesLabel').style('font-weight', 100).style('font-size', '13px');
            d3.select(this).style('font-weight', 800).style('font-size', '14px');

            let value = d3.select(this).data()[0][0];
            d3.selectAll('.typesBar')
                .attr('stroke-width', d => {
                    if (d[0] == value) return 2;
                })
            
            d3.selectAll('.typesBarText')
                .style('font-weight', d => {
                    if(d[0] == value) return 500;
                })
                .style('font-size', d => {
                    if(d[0] == value) return '14px';
                })
            
            let texts = intro.filter(d => d.categoryEn == value)[0].intro;

            d3.select('.typesSticker')
                .html(`<h3>${value}:</h3><p>${texts}</p>`)
        })
    }

    //types introduction function
    this.sticker = function(){
        d3.select('.typesSticker')
            .html('<h3>Type Name:</h3><p class="hint">Please hover over the cart or text to get further information of each poem type</p>')
    }
} 