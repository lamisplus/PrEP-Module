package org.lamisplus.modules.hiv;

import com.foreach.across.config.AcrossApplication;
import com.foreach.across.core.AcrossModule;
import com.foreach.across.core.context.configurer.ComponentScanConfigurer;
import com.foreach.across.modules.hibernate.jpa.AcrossHibernateJpaModule;
import org.lamisplus.modules.triage.TriageModule;

@AcrossApplication(
        modules = {
                 AcrossHibernateJpaModule.NAME,
                 TriageModule.NAME
        })
public class HivModule extends AcrossModule {
    public  static final String NAME = "HivModule";

    public HivModule() {
        super ();
        addApplicationContextConfigurer (new ComponentScanConfigurer (
                getClass ().getPackage ().getName () + ".repositories",
                getClass ().getPackage ().getName () + ".service",
                getClass ().getPackage ().getName () + ".controller"
        ));
    }

    @Override
    public String getName() {
        return NAME;
    }
}
