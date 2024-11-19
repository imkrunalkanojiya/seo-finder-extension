;(function($, window, document, undefined) {
    var pluginName = 'smTooltip',
        defaults = {
            offsetVertical: 5,
            offsetHorizontal: 5
        };

    function Tooltip(element, options) {
        this.el = element;
        this.$el = $(this.el);
        this.options = $.extend({}, defaults, options);

        this.init();
    }

    Tooltip.prototype = {
        init: function() {
            var $this = this;

            this.$el.mouseenter(function() {
                var title = $(this).attr('title'),
                    tooltip = $('<div class="tooltip"></div>'),
                    html = $.parseHTML(title);

                // Append the parsed HTML
                tooltip.append(html).appendTo('body');

                $(this).data('title', title).removeAttr('title');
            }).mouseleave(function() {
                $('.tooltip').remove();
                $(this).attr('title', $(this).data('title'));
            }).mousemove(function(e) {
                var tooltip = $('.tooltip'),
                    top = e.pageY + $this.options.offsetVertical,
                    bottom = 'auto',
                    left = e.pageX + $this.options.offsetHorizontal,
                    right = 'auto';

                if(top + tooltip.outerHeight() >= $(window).scrollTop() + $(window).height()){
                    bottom = $(window).height() - top + ($this.options.offsetVertical * 2);
                    top = 'auto';
                }
                if(left + tooltip.outerWidth() >= $(window).width()){
                    right = $(window).width() - left + ($this.options.offsetHorizontal * 2);
                    left = 'auto';
                }

                $('.tooltip').css({ 'top': top, 'bottom': bottom, 'left': left, 'right': right });
            });
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if(!$.data(this, pluginName)) {
                $.data(this, pluginName, new Tooltip(this, options));
            }
        });
    };
})(jQuery, window, document);
