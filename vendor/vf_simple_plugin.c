#include "framesync.h"
#include "libavutil/opt.h"
#include "libavutil/internal.h"
#include "avfilter.h"
#include "internal.h"
#include "video.h"

typedef struct SimplePluginContext
{
    const AVClass *class; // Class for this filter
    FFFrameSync fs;       // Frame synchronization context
    // Add your other filter-specific variables here
} SimplePluginContext;

#define OFFSET(x) offsetof(SimplePluginContext, x)
#define FLAGS AV_OPT_FLAG_FILTERING_PARAM | AV_OPT_FLAG_VIDEO_PARAM

static const AVOption simple_plugin_options[] = {
    // Add your filter-specific options here
    {NULL},
};

FRAMESYNC_DEFINE_CLASS(simple_plugin, SimplePluginContext, fs);

static int config_output(AVFilterLink *outLink)
{
    AVFilterContext *ctx = outLink->src;
    SimplePluginContext *c = ctx->priv;
    AVFilterLink *fromLink = ctx->inputs[0];
    AVFilterLink *toLink = ctx->inputs[1];

    if (fromLink->format != toLink->format)
    {
        av_log(ctx, AV_LOG_ERROR, "inputs must be of same pixel format\n");
        return AVERROR(EINVAL);
    }

    if (fromLink->w != toLink->w || fromLink->h != toLink->h)
    {
        av_log(ctx, AV_LOG_ERROR,
               "First input link %s parameters (size %dx%d) do not match the corresponding second input link %s parameters (size %dx%d)\n",
               ctx->input_pads[0].name, fromLink->w, fromLink->h,
               ctx->input_pads[1].name, toLink->w, toLink->h);
        return AVERROR(EINVAL);
    }

    outLink->w = fromLink->w;
    outLink->h = fromLink->h;
    outLink->frame_rate = fromLink->frame_rate;

    int ret;
    if ((ret = ff_framesync_init_dualinput(&c->fs, ctx)) < 0)
    {
        return ret;
    }
    else
    {
        return ff_framesync_configure(&c->fs);
    }
}

static const AVFilterPad simple_plugin_inputs[] = {
    {
        .name = "from",
        .type = AVMEDIA_TYPE_VIDEO,
    },
    {
        .name = "to",
        .type = AVMEDIA_TYPE_VIDEO,
    },
    {NULL},
};

static const AVFilterPad simple_plugin_outputs[] = {
    {
        .name = "default",
        .type = AVMEDIA_TYPE_VIDEO,
        .config_props = config_output,
    },
    {NULL},
};

const AVFilter ff_vf_simple_plugin = {
    .name = "simple_plugin",
    .description = NULL_IF_CONFIG_SMALL("Example of simple FFmpeg plugin"),
    .priv_size = sizeof(SimplePluginContext),
    .priv_class = &simple_plugin_class,
    .inputs = simple_plugin_inputs,
    .outputs = simple_plugin_outputs,
};