using Microsoft.Xrm.Sdk;
using OPTNC.TCRM.API.Plugins.Utility;
using OPTNC.TCRM.Plugins.Common;
using OPTNC.TCRM.Plugins.Schema;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OPTNC.TCRM.Plugins.UpdateTicket;
using System.ServiceModel;
using System.Net;
using System.ServiceModel.Channels;
using static OPTNC.TCRM.Plugins.Common.Constants;
using OPTNC.TCRM.Plugins.Utility;
using Microsoft.Xrm.Sdk.Query;

namespace TCRMPlugins
{
    public class UpdateBonus : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            StringBuilder auditLogTrace = new StringBuilder();
            LoggerDetails logDetails = new LoggerDetails();
            logDetails.ApplicationName = "OPTNC.TCRM.Plugins";
            logDetails.LogType = Enums.LogTypes.ErrorLog;
            logDetails.MethodName = "Update Bonus";
            LogFileWriter.AppnendLogInfoToStringBuilder(ref auditLogTrace, "About to call Update Bonus plugin");
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            try
            {
                if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
                {
                    Entity Entity = (Entity)context.InputParameters["Target"];

                    IOrganizationServiceFactory ServiceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                    IOrganizationService Service = ServiceFactory.CreateOrganizationService(context.UserId);

                    if (Entity.Contains("optnc_filtrespecifiquedistributeur") && Convert.ToBoolean(Entity["optnc_filtrespecifiquedistributeur"])==false)
                    {
                        Relationship relationship = new Relationship("optnc_optnc_bonus_account");

                        string accountFetchXml = @"<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>
                                              <entity name='account'>
                                                <attribute name='name' />
                                                <attribute name='primarycontactid' />
                                                <attribute name='accountnumber' />
                                                <attribute name='accountid' />
                                                <order attribute='name' descending='false' />
                                                <link-entity name='optnc_optnc_bonus_account' from='accountid' to='accountid' visible='false' intersect='true'>
                                                  <link-entity name='optnc_bonus' from='optnc_bonusid' to='optnc_bonusid' alias='ab'>
                                                    <filter type='and'>
                                                      <condition attribute='optnc_bonusid' operator='eq' value='{" + Convert.ToString(Entity.Id) + @"}' />
                                                    </filter>
                                                  </link-entity>
                                                </link-entity>
                                              </entity>
                                            </fetch>";


                        EntityCollection accountEntities = Service.RetrieveMultiple(new FetchExpression(accountFetchXml));

                        if (accountEntities.Entities.Count > 0)
                        {
                            EntityReferenceCollection relatedEntities = new EntityReferenceCollection();

                            foreach (Entity accountEntity in accountEntities.Entities)
                            {

                                EntityReference secondaryEntity = new EntityReference(accountEntity.LogicalName, accountEntity.Id);
                                relatedEntities.Add(secondaryEntity);
                            }

                            Service.Disassociate(Entity.LogicalName, Entity.Id, relationship, relatedEntities);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logDetails.LogMessage = auditLogTrace.ToString();
                LogFileWriter.WriteToLogFile(logDetails);
                throw ex;
            }
        }
    }
}
