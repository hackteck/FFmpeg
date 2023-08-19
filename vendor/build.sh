# ln -s $HOME/photographer/src/FFmpeg/vendor/build.sh $HOME/build.sh
sudo apt-get install libglfw3-dev libglew-dev libx264-dev -y

cd $HOME
rm -rf ./FFmpeg/
git clone --depth 1 --branch n4.3 https://github.com/FFmpeg/FFmpeg

cp ./photographer/src/FFmpeg/vendor/vf_glsl.c ./FFmpeg/libavfilter/
sed -i '/extern const AVFilter ff_vf_zscale;/a extern const AVFilter ff_vf_glsl;' ./FFmpeg/libavfilter/allfilters.c
sed -i '/extern AVFilter ff_vf_zscale;/a extern AVFilter ff_vf_glsl;' ./FFmpeg/libavfilter/allfilters.c
sed -i '/+= vf_zscale.o/a OBJS-$(CONFIG_GLSL_FILTER) += vf_glsl.o' ./FFmpeg/libavfilter/Makefile

cd FFmpeg
CONFIG_ARGS=(
    --target-os=none                            # use none to prevent any os specific configurations
    --arch=x86_32                               # use x86_32 to achieve minimal architectural optimization
    --enable-cross-compile                      # enable cross compile
    --disable-x86asm                            # disable x86 asm
    --disable-inline-asm                        # disable inline asm
    --disable-stripping                         # disable stripping
    --disable-ffplay                            # disable ffplay build
    --disable-doc                               # disable doc
    --enable-gpl                                # required by x264
    --enable-libx264                            # enable x264
    --enable-opengl
    # --disable-everything
    # --enable-filter=glsl
    # --enable-protocol=file
)
./configure "${CONFIG_ARGS[@]}"

make -j4
