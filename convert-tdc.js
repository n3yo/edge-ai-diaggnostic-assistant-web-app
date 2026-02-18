const fs = require('fs');
const path = require('path');

const tdc = JSON.parse(fs.readFileSync(path.join(__dirname, 'tdc_prompts.json'), 'utf8'));

// Category mapping based on task name patterns
function getCategory(key) {
  const k = key.toLowerCase();
  if (k.startsWith('toxcast_')) return 'ToxCast';
  if (k.includes('cyp') && (k.includes('veith') || k.includes('substrate') || k.startsWith('tox'))) return 'Metabolism';
  if (k.startsWith('cyp')) return 'Metabolism';
  if (['bbb_martins','hia_hou','caco2_wang','pgp_broccatelli','bioavailability_ma','pampa_ncats'].includes(k)) return 'ADME';
  if (['solubility_aqsoldb','lipophilicity_astrazeneca','hydrationfreeenergy_freesolv','ppbr_az','vdss_lombardo'].includes(k)) return 'Physicochemical';
  if (['herg','ames','dili','clintox','skin_reaction','carcinogens_lagunin','herg_central','herg_karim'].includes(k)) return 'Toxicity';
  if (k.startsWith('tox21_')) return 'Toxicity';
  if (['sarscov2_vitro_touret','sarscov2_3clpro_diamond','hiv'].includes(k)) return 'Antiviral';
  if (k.includes('butkiewicz')) return 'Activity';
  if (['mhc1_iedb_imgt_nielsen','mhc2_iedb_jensen'].includes(k)) return 'Immunology';
  if (k === 'weber') return 'Immunology';
  if (k === 'huri') return 'Protein Interaction';
  if (k === 'sabdab_chen') return 'Antibody';
  if (k === 'mirtarbase') return 'RNA';
  return 'ToxCast';
}

// Human-readable name from task key
function getName(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Short description from task key + category
function getDescription(key, category) {
  const k = key.toLowerCase();
  if (k === 'bbb_martins') return 'Predict blood-brain barrier permeability of a drug compound.';
  if (k === 'hia_hou') return 'Predict human intestinal absorption of a drug compound.';
  if (k === 'caco2_wang') return 'Predict Caco-2 cell permeability as a model of intestinal absorption.';
  if (k === 'pgp_broccatelli') return 'Predict whether a drug is a P-glycoprotein substrate for efflux transport.';
  if (k === 'bioavailability_ma') return 'Predict the oral bioavailability of a drug compound.';
  if (k === 'pampa_ncats') return 'Predict passive membrane permeability using the PAMPA assay.';
  if (k === 'herg') return 'Predict hERG channel blockade liability of a compound.';
  if (k === 'ames') return 'Predict mutagenicity of a compound using the Ames test.';
  if (k === 'dili') return 'Predict drug-induced liver injury risk for a compound.';
  if (k === 'clintox') return 'Predict whether a drug failed clinical trials due to toxicity.';
  if (k === 'skin_reaction') return 'Predict skin sensitization potential of a compound.';
  if (k === 'carcinogens_lagunin') return 'Predict carcinogenicity of a chemical compound.';
  if (k === 'herg_central') return 'Predict hERG inhibition using the hERG Central dataset.';
  if (k === 'herg_karim') return 'Predict hERG-mediated cardiotoxicity using the Karim dataset.';
  if (k.startsWith('cyp') && k.includes('veith')) return `Predict whether a drug inhibits the ${key.split('_')[0].toUpperCase()} enzyme.`;
  if (k.startsWith('cyp') && k.includes('substrate')) return `Predict whether a drug is a substrate of the ${key.split('_')[0].toUpperCase()} enzyme.`;
  if (k.startsWith('tox21_')) return `Predict toxicity in the Tox21 ${key.replace('Tox21_', '').replace(/_/g, ' ')} assay.`;
  if (k === 'sarscov2_vitro_touret') return 'Predict in vitro anti-SARS-CoV-2 activity of a compound.';
  if (k === 'sarscov2_3clpro_diamond') return 'Predict inhibition of SARS-CoV-2 3CLpro protease.';
  if (k === 'hiv') return 'Predict anti-HIV activity of a compound.';
  if (k.includes('butkiewicz')) return `Predict activity against ${key.replace('_butkiewicz', '').replace(/_/g, ' ')} target.`;
  if (k === 'mhc1_iedb_imgt_nielsen') return 'Predict MHC class I peptide binding affinity for immunogenicity screening.';
  if (k === 'mhc2_iedb_jensen') return 'Predict MHC class II peptide binding affinity for immunogenicity screening.';
  if (k === 'weber') return 'Predict T-cell receptor (TCR) binding to epitope sequences.';
  if (k === 'huri') return 'Predict human protein-protein interactions from the HuRI dataset.';
  if (k === 'sabdab_chen') return 'Predict antibody-antigen binding from heavy and light chain sequences.';
  if (k === 'mirtarbase') return 'Predict miRNA target gene regulation from miRNA and mRNA sequences.';
  if (k.startsWith('toxcast_')) return `Predict toxicity in the ToxCast ${key.replace('ToxCast_', '')} assay.`;
  return `Predict drug toxicity or activity in the ${key.replace(/_/g, ' ')} assay.`;
}

const tasks = Object.entries(tdc).map(([key, prompt_template], idx) => ({
  id: idx + 1,
  name: getName(key),
  task_name: key,
  description: getDescription(key, getCategory(key)),
  category: getCategory(key),
  prompt_template
}));

const output = { tasks };
fs.writeFileSync(path.join(__dirname, 'Task.json'), JSON.stringify(output, null, 2), 'utf8');
console.log(`Done. Wrote ${tasks.length} tasks to Task.json`);
