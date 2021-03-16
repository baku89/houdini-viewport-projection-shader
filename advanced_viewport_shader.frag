#version 330


#line 1

#define PI 3.14159265358979323

in wparms
{
    vec4 pos;
    vec3 normal;
    vec4 color;
    vec2 texcoord0;
    noperspective in vec3 edgedist;
    flat in int edgeflags;
    float selected;

    // Projection
    flat in int projection;
    vec3 rest;
} fsIn;

layout(std140) uniform glH_Material
{
    vec3            ambient_color;
    vec3            diffuse_color;
    vec3            emission_color;
    vec3            specular_color;
    vec3            metallic_color;
    float           metal;
    float           material_alpha;
    float           material_alpha_parallel;
    float           roughness;
    float           diffuse_roughness;
    float           ior;
    float           reflection;
    float           coat_intensity;
    float           coat_roughness;
    int             specular_model;
    int             coat_spec_model;
    float           specular_tint;

    bool            use_geo_color;
    bool            use_packed_color;

    bool            has_textures;
    bool            has_diffuse_map;
    bool            has_spec_map;
    bool            has_opacity_map;
    bool            has_emission_map;
    bool            has_normal_map;
    bool            has_rough_map;
    bool            has_displace_map;
    bool            has_occlusion_map;
    bool            has_metallic_map;
    bool            has_coat_int_map;
    bool            has_coat_rough_map;
    bool            has_reflection_int_map;
    bool            has_reflect_map;
    
    ivec4           diffuse_udim_area;
    ivec4           spec_udim_area;
    ivec4           opacity_udim_area;
    ivec4           emission_udim_area;
    ivec4           normal_udim_area;
    ivec4           rough_udim_area; 
    ivec4           displace_udim_area;
    ivec4           occlusion_udim_area;
    ivec4           metallic_udim_area;
    ivec4           coat_int_udim_area;
    ivec4           coat_rough_udim_area;
    ivec4           reflection_udim_area;

    bool            has_diffuse_uv_xform;
    bool            has_spec_uv_xform;
    bool            has_opacity_uv_xform;
    bool            has_emission_uv_xform;
    bool            has_normal_uv_xform;
    bool            has_rough_uv_xform;
    bool            has_displace_uv_xform;
    bool            has_occlusion_uv_xform;
    bool            has_metallic_uv_xform;
    bool            has_coat_int_uv_xform;
    bool            has_coat_rough_uv_xform;
    bool            has_reflect_uv_xform;
    mat3            diffuse_uv_xform;
    mat3            spec_uv_xform;
    mat3            opacity_uv_xform;
    mat3            emission_uv_xform;
    mat3            normal_uv_xform;
    mat3            rough_uv_xform;
    mat3            displace_uv_xform;
    mat3            occlusion_uv_xform;
    mat3            metallic_uv_xform;
    mat3            coat_int_uv_xform;
    mat3            coat_rough_uv_xform;
    mat3            reflect_uv_xform;
    
    bool            has_env_map;
    vec3            envScale;
    mat3            envRotate;

    vec2            normalMapScaleShift;
    vec2            normalMapScale;
    vec3            normalMapXYZScale;
    int             normal_map_type; // space: 0=tangent, 1=world  
    int             normal_map_ncomps; // 2 or 3 component

    int             displace_space;
    float           displace_scale;
    float           displace_offset;
    bool            displace_y_up; // vs. z-up

    bool            invert_opacitymap;

    bool            invert_roughmap;
    vec4            rough_comp;
    
    vec4            occlusion_comp;
    vec4            metallic_comp;
    vec4            coat_int_comp;
    vec4            coat_rough_comp;
    vec4            opacity_comp;

    bool            reflection_as_ior;
    vec4            reflection_comp;
};

vec4  HOUsampleDiffuseMap(vec2 tx);
vec3  HOUsampleEmissionMap(vec2 tx);
float HOUsampleOpacityMap(vec2 tx, bool invert, vec4 comp);

// #if MAX_TEXTURE_SAMPLERS >= 32
// can only do occlusion if the #texture units supports it
uniform sampler2D glH_OcclusionMap;
uniform sampler2DArray glH_OcclusionArrayMap;
uniform sampler2D glH_MetallicMap;
uniform sampler2DArray glH_MetallicArrayMap;
vec4 HOUsampleGenericMap(vec2 coords,
                         sampler2D reg_map,
                         sampler2DArray array_map,
                         ivec4 udim_area,
                         bool xform_uvs,
                         mat3 uv_xform);
// #endif

uniform int glH_LightingEnabled;
uniform int glH_MaterialPass;
uniform samplerCube glH_EnvMap;
uniform float glH_SceneIOR;
uniform float glH_Specular;

void  HOUlightingModel(vec3 P, vec3 nN,
                       vec3 m_amb,
                       vec3 m_diff,
                       vec3 m_spec,
                       vec3 m_metal,
                       inout vec3 lAmb,
                       inout vec3 lDiff,
                       inout vec3 lSpec,
                       float rough,
                       float diff_rough,
                       float ior,
                       float metal,
                       int spec_model,
                       float alpha);

void HOUassignOutputs(vec3 point_color,
                      vec3 emit_color,
                      vec3 metal_color,
                      vec3 amb_color,
                      vec3 diff_color,
                      vec3 spec_color,
                      float alpha,
                      float emit_alpha,
                      float rough,
                      float diff_rough,
                      float ior,
                      float metal,
                      float coat_intensity,
                      float coat_rough,
                      vec4 wire,
                      vec3 nN,
                      float depth,
                      float selected,
                      int lighting_model,
                      int coat_model);
vec4 HOUwireColor(vec3 edges, int edgeflags, float selected);
float HOUfresnel(float alpha_perp, float alpha_para, vec3 nN, vec3 p);
float HOUreflectionIOR(vec3 eye, vec3 n, float ior_surface, float ior_scene);

void HOUapplyLightMaps(inout vec3 mspec, inout float rough,
                       bool has_spec_map, vec2 uv,
                       bool invert_rough, vec4 rough_comp);

vec4 HOUenvmapReflect(samplerCube map, vec3 nN, vec3 p, mat3 envRotate,
                      vec3 envScale, float r, bool correct, vec3 correctvec);
vec3 HOUapplyNormalMap(vec3 P, vec3 N, vec2 uv);
vec3 HOUfrontFacing(vec3 n, vec3 p);

uniform float glH_Ambient;

float atan2(in float y, in float x){
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

void main()
{
    vec3 nN, p;
    vec3 lspec, ldiff, lamb, ptcol;
    vec4 tex;
    vec3 mspec, memit;
    vec3 envmap;
    vec4 wire;

    float rough, alpha, mtl, diff_rough;

    p = fsIn.pos.xyz / fsIn.pos.w;
    ptcol = fsIn.color.rgb * fsIn.color.a;
    nN = fsIn.normal;
    rough = roughness;
    diff_rough = diffuse_roughness;

    lamb  = vec3(0.0);
    ldiff = vec3(1.0);
    lspec = vec3(0.0);
    envmap = vec3(0.0);
    mtl = metal;

    // read in texture maps 
    vec2 texcoord = fsIn.texcoord0;

    vec3 rest = fsIn.rest;
    if (fsIn.projection == 1) {
        // Parallel
        texcoord = rest.xy / 2.0 + 0.5;
    } else if (fsIn.projection == 2) {
        // Spherical
        texcoord = vec2(
            atan2(rest.z, rest.x) / PI / 2.0 + 0.5,
            atan2(rest.y, length(rest.xz)) / PI + 0.5
        );
    } else if (fsIn.projection == 3) {
        // Camera
        texcoord = rest.xy / rest.z / -2.0 + 0.5;
    }

    if(has_diffuse_map)
        tex = HOUsampleDiffuseMap(texcoord);
    else
        tex = vec4(1.0);

    if(has_opacity_map)
        tex.a *= HOUsampleOpacityMap(texcoord, invert_opacitymap,
                                     opacity_comp);

    // tex.rgb *= fsIn.rest;

    if(has_emission_map)
        memit = HOUsampleEmissionMap(texcoord);
    else
        memit = vec3(0.0);

// #if MAX_TEXTURE_SAMPLERS >= 32
    if(has_occlusion_map)
        tex.rgb *= dot(HOUsampleGenericMap(texcoord,
                                           glH_OcclusionMap,
                                           glH_OcclusionArrayMap,
                                           occlusion_udim_area,
                                           has_occlusion_uv_xform,
                                           occlusion_uv_xform),
                       occlusion_comp);
    if(has_metallic_map)
        mtl *= dot(HOUsampleGenericMap(texcoord,
                                       glH_MetallicMap,
                                       glH_MetallicArrayMap,
                                       metallic_udim_area,
                                       has_metallic_uv_xform,
                                       metallic_uv_xform),
                   metallic_comp);
// #endif
    
    if(glH_LightingEnabled != 0)
    {
        // Specular model mode
        mspec = mix(vec3(dot(specular_color, vec3(0.3,0.6,0.1))),
                    specular_color, specular_tint);

        // Normal map
        if(has_normal_map)
            nN = HOUapplyNormalMap(p, nN, texcoord);

        // Roughness
        float rough_map = 1.0;
        HOUapplyLightMaps(mspec, rough_map, has_spec_map, texcoord,
                          invert_roughmap, rough_comp);
        rough *= rough_map;
        diff_rough *= rough_map;
        alpha = fsIn.color.a * tex.a;

        nN = HOUfrontFacing(nN, p);

        float reflect = HOUreflectionIOR(-p, nN, ior, glH_SceneIOR);
        vec3 diff = diffuse_color;

        // Transparency
        if(material_alpha != material_alpha_parallel)
        {
            alpha = HOUfresnel(alpha * material_alpha,
                               alpha * material_alpha_parallel,
                               nN, p);
        }
        else
        {
            alpha*=material_alpha;
            diff *= alpha;
            if(!has_env_map)
                lspec += vec3(reflect) * mspec * (1-alpha) * 0.5;
            if(glH_Specular > 0.0)
                alpha = 1.0 - (1.0-alpha) * (1.0 - reflect);
        }

        if(glH_MaterialPass == 0)
        {
            // Direct lighting pass, compute illumination
            lamb  = vec3(0.0);
            ldiff = vec3(0.0);
            if(has_env_map)
                lspec = vec3(0.0);
            else
                lspec += vec3(reflect) * mspec * (1-alpha) * 0.5;
            HOUlightingModel(p, nN, ambient_color,diff,specular_color,
                             metallic_color, lamb, ldiff, lspec,
                             rough, diff_rough, ior, mtl, specular_model,alpha);

#ifndef MAT
#define MAT(m) m
#endif

// Needs:
// float reflect, mtl, alpha, rough
// vec3 nN, mspec, lamb, p, ldiff, lspec, lamb


if (MAT(has_env_map))
{
    float rough1 = 1.0 - rough;
    float F = reflect * rough1;
    float DF = 1.0 - F * MAT(reflection);
    float mtl1 = 1.0 - mtl;
    float F1 = 1.0 - F;
    
    vec3 amb = HOUenvmapReflect(glH_EnvMap, nN, p, MAT(envRotate), 
                                MAT(envScale), 1.0, false,
                                vec3(0.0)).rgb;
    vec3 refl = HOUenvmapReflect(glH_EnvMap, nN, p, MAT(envRotate),
                                 MAT(envScale), rough, false,
                                 vec3(0.0)).rgb;

    vec3 fres_refl =       refl * MAT(metallic_color);
    vec3 reg_refl = mtl1 * refl * mspec * MAT(reflection) *F;
    vec3 mtl_refl = mtl *  refl * MAT(diffuse_color) * mix(1.0,0.318, rough);

    envmap = 0.5 * F1* reg_refl + mtl_refl;

    ldiff += alpha * MAT(ambient_color) * amb * mtl1 * mix(DF, 1.0, mtl);
    ldiff -= lamb * alpha * glH_Ambient * mtl * rough1;
    lspec += max(MAT(reflection),mtl) * F * fres_refl;
    lamb *= rough1 * mtl;
}
        }
        else
            lspec = mspec;
    }
    else
    {
        lspec = vec3(0.0);
        ldiff = diffuse_color;
        lamb = ambient_color;
        alpha = HOUfresnel(material_alpha, material_alpha_parallel, nN, p)
            * fsIn.color.a * tex.a;
    }

    // blend in wire color around the edges of polygons, if wire-over-shaded
    // active
    wire = HOUwireColor(fsIn.edgedist,fsIn.edgeflags,fsIn.selected);

    // Write out the data to either the forward renderer framebuffer or the
    // deferred framebuffer (glH_MaterialPass==1).
    HOUassignOutputs(ptcol,
                     emission_color + memit,
                     metallic_color,
                     lamb* tex.rgb,
                     ldiff* tex.rgb,
                     lspec + envmap,
                     alpha,
                     wire.a,
                     rough,
                     diff_rough,
                     ior,
                     mtl,
                     coat_intensity,
                     coat_roughness,
                     wire,
                     nN,
                     p.z,
                     fsIn.selected,
                     specular_model, coat_spec_model);
}
