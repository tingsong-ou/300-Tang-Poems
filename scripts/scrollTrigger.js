//SCROLL TRIGGER

gsap.registerPlugin(ScrollTrigger);

let ScrollActions = function(){

    //--------PROPERTY AND SETTER--------
    this._dispatch = null;
    
    this.dispatch = function(){
        if(arguments.length > 0){
            this._dispatch = arguments[0];
            return this;
        } else return this._dispatch;
    }


    //--------FUNCTION--------
    this.trigger = function(){

        //scroll trigger for timeline chart
        gsap.to('.introduction',{
            scrollTrigger:{
                trigger:'.introduction',
                start: 'top 20%',
                end: 'bottom center',
                id: 'timeline',
                markers: false,
                onEnter: () => {
                    this._dispatch.call('expandBars', this);
                    this._dispatch.call('expandMarks', this);
                }
            }
        });

        //scroll trigger for poet list chart
        gsap.to('.poets',{
            scrollTrigger:{
                trigger:'.poets',
                start: 'top 20%',
                end: 'bottom center',
                markers: false,
                onEnter: () => {
                    this._dispatch.call('expandPoets', this);
                }
            }
        });
    }
}