let typesPie = function(){
    this._data = null;
    this._selection = null;
    this._innerRadius = 60;
    this._outerRadius = 250;
    this._size = null;
    this._colorScale = null;
    let canvas = null;

    //SETTERS
    this.data = function(){
        if(arguments.length > 0){
            this._data = arguments[0];
            return this;
        } else return this_data;
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

    //FUNCTIONS

    this.draw = function(){
        this.groupData();

        let xScale = d3.scaleBand()
            .domain(this._data.map(d => d[0]))
            .range([0, Math.PI * 2]);
        
        console.log(xScale.domain())

        let yScale = d3.scaleRadial()
            .domain([0, d3.max(this._data.map(d => d[2].length))])
            .range([this._innerRadius, this._outerRadius]);
        
        let textPos = d3.scaleBand()
            .domain(this._data.map(d => d[0]))
            .range([-10, 220]);
        
        console.log(textPos.range());
        
        let arc = d3.arc()
            .innerRadius(d => yScale(0))
            .outerRadius(d => yScale(d[2].length))
            .startAngle(d => xScale(d[0]))
            .endAngle(d => xScale(d[0]) + xScale.bandwidth())
            .padAngle(0.07)
            .padRadius(this._innerRadius);
        
        let canvas = this._selection.append('g')
            .attr('transform', `translate(${this._size.w/4}, ${this._size.h/2})`);

        let bars = canvas.append('g')
            .selectAll('g')
            .data(this._data)
            .join('g');
        
        bars.selectAll('path')
            .data(d => [d])
            .join('path')
            .classed('typesBar', true)
            .attr('d', arc);
        
        let texts = canvas.append('g');
        
        texts.selectAll('.typesLabel')
            .data(this._data)
            .join('text')
            .classed('typesLabel', true)
            .attr('x', 250)
            .attr('y', d => textPos(d[0]))
            .text(d => d[0] + ' - ' + d[1]);
        
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
        });

    }

    this.groupData = function(){
        let group = d3.group(this._data, d=>d.categoryEn)
        group = Array.from(group);
        group.forEach(d => d.splice(1, 0, d[1][0].categoryCh))
        this._data = group;
    }
} 